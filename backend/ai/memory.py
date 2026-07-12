import json
import time
from datetime import datetime, timedelta
from collections import OrderedDict

try:
    from typing import List, Dict, Optional, TypedDict
except ImportError:
    from typing_extensions import TypedDict
    from typing import List, Dict, Optional

try:
    from sqlalchemy import select, func, desc
    from sqlalchemy.ext.asyncio import AsyncSession
    from db.database import get_db
    from models.memory import Memory
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False


class MemoryItem(TypedDict):
    content: str
    timestamp: float
    importance: float
    category: str
    decay_rate: float
    is_short_term: bool


class PetMemory:
    def __init__(self, pet_id: str):
        self.pet_id = pet_id
        self.long_term_memories: OrderedDict[str, MemoryItem] = OrderedDict()
        self.short_term_memories: List[MemoryItem] = []
        self.max_long_term = 100
        self.max_short_term = 20
        self.forget_rate = 0.01

    async def add_memory(self, content: str, importance: float = 0.5, category: str = "general", memory_type: str = "event"):
        memory: MemoryItem = {
            "content": content,
            "timestamp": time.time(),
            "importance": importance,
            "category": category,
            "decay_rate": self.forget_rate,
            "is_short_term": True,
        }

        self.short_term_memories.append(memory)

        if HAS_SQLALCHEMY:
            async for session in get_db():
                db_memory = Memory(
                    pet_id=self.pet_id,
                    content=content,
                    memory_type=memory_type,
                    importance=importance,
                    category=category,
                    tags=[category],
                    is_short_term=True,
                    decay_rate=self.forget_rate,
                )
                session.add(db_memory)
                await session.commit()

        if len(self.short_term_memories) > self.max_short_term:
            oldest = self.short_term_memories.pop(0)
            await self._promote_to_long_term(oldest)

    async def _promote_to_long_term(self, memory: MemoryItem):
        mem_id = f"{memory['timestamp']:.0f}_{hash(memory['content']) % 10000}"
        
        if memory["importance"] < 0.3:
            return

        if len(self.long_term_memories) >= self.max_long_term:
            await self._prune_old_memories()

        memory["is_short_term"] = False
        self.long_term_memories[mem_id] = memory
        self.long_term_memories.move_to_end(mem_id)

        if HAS_SQLALCHEMY:
            async for session in get_db():
                result = await session.execute(
                    select(Memory).filter(
                        Memory.pet_id == self.pet_id,
                        Memory.content == memory["content"],
                        Memory.is_short_term == True
                    ).order_by(desc(Memory.created_at)).limit(1)
                )
                db_memory = result.scalar_one_or_none()
                if db_memory:
                    db_memory.is_short_term = False
                    db_memory.memory_type = "long_term"
                    await session.commit()

    async def _prune_old_memories(self):
        now = time.time()
        to_remove = []
        
        for mem_id, memory in self.long_term_memories.items():
            age_days = (now - memory["timestamp"]) / 86400
            current_importance = memory["importance"] * (1 - memory["decay_rate"] * age_days)
            if current_importance < 0.1:
                to_remove.append(mem_id)

        for mem_id in to_remove:
            del self.long_term_memories[mem_id]

        if HAS_SQLALCHEMY:
            async for session in get_db():
                cutoff_time = datetime.fromtimestamp(now - 30 * 86400)
                await session.execute(
                    Memory.__table__.delete().where(
                        Memory.pet_id == self.pet_id,
                        Memory.is_short_term == False,
                        Memory.created_at < cutoff_time,
                        Memory.importance < 0.1
                    )
                )
                await session.commit()

    async def get_short_term_memories(self, hours: int = 24) -> List[MemoryItem]:
        now = time.time()
        cutoff = now - hours * 3600
        
        recent = [
            m for m in reversed(self.short_term_memories)
            if m["timestamp"] >= cutoff
        ]

        if HAS_SQLALCHEMY:
            async for session in get_db():
                cutoff_time = datetime.fromtimestamp(cutoff)
                result = await session.execute(
                    select(Memory).filter(
                        Memory.pet_id == self.pet_id,
                        Memory.is_short_term == True,
                        Memory.created_at >= cutoff_time
                    ).order_by(desc(Memory.created_at))
                )
                db_memories = result.scalars().all()
                
                for m in db_memories:
                    mem_item: MemoryItem = {
                        "content": m.content,
                        "timestamp": m.created_at.timestamp(),
                        "importance": m.importance,
                        "category": m.category,
                        "decay_rate": m.decay_rate or self.forget_rate,
                        "is_short_term": True,
                    }
                    if mem_item not in recent:
                        recent.append(mem_item)

        return recent

    async def get_long_term_memories(self, limit: int = 20) -> List[MemoryItem]:
        result = list(self.long_term_memories.values())[-limit:]
        
        if HAS_SQLALCHEMY:
            async for session in get_db():
                db_result = await session.execute(
                    select(Memory).filter(
                        Memory.pet_id == self.pet_id,
                        Memory.is_short_term == False
                    ).order_by(desc(Memory.created_at)).limit(limit)
                )
                db_memories = db_result.scalars().all()
                
                for m in db_memories:
                    mem_item: MemoryItem = {
                        "content": m.content,
                        "timestamp": m.created_at.timestamp(),
                        "importance": m.importance,
                        "category": m.category,
                        "decay_rate": m.decay_rate or self.forget_rate,
                        "is_short_term": False,
                    }
                    existing = next((r for r in result if r["content"] == m.content), None)
                    if not existing:
                        result.append(mem_item)

        return result

    async def get_recent_memories(self, hours: int = 24, limit: int = 10) -> List[MemoryItem]:
        short_term = await self.get_short_term_memories(hours)
        long_term = await self.get_long_term_memories(limit)
        
        combined = short_term + long_term
        combined.sort(key=lambda x: x["timestamp"], reverse=True)
        
        return combined[:limit]

    async def get_weighted_summary(self, limit: int = 5) -> str:
        now = time.time()
        scored = []

        for m in self.short_term_memories:
            age_hours = (now - m["timestamp"]) / 3600
            score = m["importance"] * (1 - min(age_hours * 0.1, 0.9))
            if score > 0:
                scored.append((score, m))

        for mem_id, m in self.long_term_memories.items():
            age_days = (now - m["timestamp"]) / 86400
            current_importance = m["importance"] * (1 - m["decay_rate"] * age_days)
            score = current_importance * (1 - min(age_days * 0.02, 0.5))
            if score > 0.1:
                scored.append((score, m))

        scored.sort(key=lambda x: x[0], reverse=True)

        summaries = []
        for score, m in scored[:limit]:
            time_ago = self._format_time_ago(m["timestamp"])
            summaries.append(f"- {m['content']} ({time_ago})")

        return "\n".join(summaries) if summaries else "暂无重要记忆"

    async def get_weighted_memories(self, limit: int = 10) -> List[Dict]:
        now = time.time()
        scored = []

        for m in self.short_term_memories:
            age_hours = (now - m["timestamp"]) / 3600
            score = m["importance"] * (1 - min(age_hours * 0.1, 0.9))
            if score > 0:
                scored.append((score, m))

        for mem_id, m in self.long_term_memories.items():
            age_days = (now - m["timestamp"]) / 86400
            current_importance = m["importance"] * (1 - m["decay_rate"] * age_days)
            score = current_importance * (1 - min(age_days * 0.02, 0.5))
            if score > 0.1:
                scored.append((score, m))

        scored.sort(key=lambda x: x[0], reverse=True)

        return [
            {
                "content": m["content"],
                "importance": m["importance"],
                "category": m["category"],
                "timestamp": m["timestamp"],
                "time_ago": self._format_time_ago(m["timestamp"]),
                "score": score,
                "is_short_term": m["is_short_term"],
            }
            for score, m in scored[:limit]
        ]

    def _format_time_ago(self, timestamp: float) -> str:
        now = time.time()
        diff = now - timestamp

        if diff < 60:
            return "刚刚"
        elif diff < 3600:
            return f"{int(diff // 60)}分钟前"
        elif diff < 86400:
            return f"{int(diff // 3600)}小时前"
        elif diff < 604800:
            return f"{int(diff // 86400)}天前"
        else:
            return datetime.fromtimestamp(timestamp).strftime("%m-%d")

    async def daily_maintenance(self):
        now = time.time()
        yesterday = now - 86400

        to_promote = []
        for m in self.short_term_memories[:]:
            if m["timestamp"] < yesterday:
                to_promote.append(m)
                self.short_term_memories.remove(m)

        for m in to_promote:
            await self._promote_to_long_term(m)

        await self._prune_old_memories()

        if HAS_SQLALCHEMY:
            async for session in get_db():
                yesterday_time = datetime.fromtimestamp(yesterday)
                await session.execute(
                    Memory.__table__.update().where(
                        Memory.pet_id == self.pet_id,
                        Memory.is_short_term == True,
                        Memory.created_at < yesterday_time
                    ).values(is_short_term=False, memory_type="long_term")
                )
                
                cutoff_time = datetime.fromtimestamp(now - 30 * 86400)
                await session.execute(
                    Memory.__table__.delete().where(
                        Memory.pet_id == self.pet_id,
                        Memory.is_short_term == False,
                        Memory.created_at < cutoff_time,
                        Memory.importance < 0.1
                    )
                )
                
                await session.commit()

    async def reflect(self) -> Dict[str, str]:
        recent = await self.get_recent_memories(hours=48)
        if not recent:
            return {
                "summary": "今天过得很平淡，没有特别的事情发生。",
                "highlights": [],
                "learning": "",
            }

        summaries = []
        highlights = []

        for m in recent:
            summaries.append(m["content"])
            if m["importance"] > 0.7:
                highlights.append(m["content"])

        summary_text = "\n".join(summaries[:5])
        highlights_text = ", ".join(highlights) if highlights else "没有特别突出的事情"

        return {
            "summary": summary_text,
            "highlights": highlights,
            "most_important": highlights[0] if highlights else "",
            "feeling": self._infer_mood(),
        }

    def _infer_mood(self) -> str:
        recent = self.short_term_memories[-10:]
        if not recent:
            return "平静"

        positive_count = sum(1 for m in recent if any(k in m["content"] for k in ["开心", "发现", "遇到", "得到", "成功"]))
        negative_count = sum(1 for m in recent if any(k in m["content"] for k in ["累", "饿", "难过", "失败", "迷路"]))

        if positive_count > negative_count:
            return "开心"
        elif negative_count > positive_count:
            return "低落"
        else:
            return "平静"

    def clear_short_term(self):
        self.short_term_memories.clear()

    def to_dict(self) -> dict:
        return {
            "pet_id": self.pet_id,
            "long_term": list(self.long_term_memories.values()),
            "short_term": self.short_term_memories,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "PetMemory":
        memory = cls(data["pet_id"])
        for m in data.get("long_term", []):
            mem_id = f"{m['timestamp']:.0f}_{hash(m['content']) % 10000}"
            memory.long_term_memories[mem_id] = m
        memory.short_term_memories = data.get("short_term", [])
        return memory

    @classmethod
    async def from_db(cls, pet_id: str) -> "PetMemory":
        memory = cls(pet_id)
        if HAS_SQLALCHEMY:
            async for session in get_db():
                result = await session.execute(
                    select(Memory).filter(Memory.pet_id == pet_id).order_by(Memory.created_at)
                )
                db_memories = result.scalars().all()

                for m in db_memories:
                    mem_item: MemoryItem = {
                        "content": m.content,
                        "timestamp": m.created_at.timestamp(),
                        "importance": m.importance,
                        "category": m.category,
                        "decay_rate": m.decay_rate or 0.01,
                        "is_short_term": m.is_short_term if hasattr(m, 'is_short_term') else (m.memory_type == "short_term"),
                    }
                    if mem_item["is_short_term"]:
                        memory.short_term_memories.append(mem_item)
                    else:
                        mem_id = f"{mem_item['timestamp']:.0f}_{hash(mem_item['content']) % 10000}"
                        memory.long_term_memories[mem_id] = mem_item

        return memory


memory_store: Dict[str, PetMemory] = {}


async def get_pet_memory(pet_id: str) -> PetMemory:
    if pet_id not in memory_store:
        memory_store[pet_id] = await PetMemory.from_db(pet_id)
    return memory_store[pet_id]


async def save_memory(pet_id: str, memory: PetMemory):
    memory_store[pet_id] = memory


async def load_memory(pet_id: str) -> Optional[PetMemory]:
    return memory_store.get(pet_id)


async def run_daily_maintenance():
    for pet_id in list(memory_store.keys()):
        memory = memory_store[pet_id]
        await memory.daily_maintenance()
        memory_store[pet_id] = memory
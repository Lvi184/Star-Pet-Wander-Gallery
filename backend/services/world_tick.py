import random
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.pet import Pet
from models.event import PetEvent


REGIONS = ["star-forest", "moon-lake", "crater", "crystal-cave", "cloud-peaks", "abyss"]
REGION_NAMES = {
    "star-forest": "星光森林",
    "moon-lake": "月牙湖",
    "crater": "陨石坑",
    "crystal-cave": "水晶洞窟",
    "cloud-peaks": "云巅峰",
    "abyss": "深渊裂谷",
}

ITEMS = ["星光石碎片", "月牙草", "紫晶花", "流星碎片", "云之泪", "深渊宝珠", "友谊徽章"]


class WorldTickService:
    MAX_EVENTS_PER_SYNC = 20
    MIN_OFFLINE_SECONDS = 300
    SECONDS_PER_TICK = 3600

    @classmethod
    async def calculate_offline_duration(cls, last_online_time: datetime) -> int:
        now = datetime.now(last_online_time.tzinfo) if last_online_time.tzinfo else datetime.now()
        duration = (now - last_online_time).total_seconds()
        return max(0, int(duration))

    @classmethod
    async def generate_tick_events(cls, pet: Pet, tick_count: int) -> List[Dict]:
        events = []
        current_region = pet.current_region or "star-forest"
        current_mood = pet.mood
        current_energy = pet.energy
        inventory = pet.inventory or []

        for _ in range(tick_count):
            event = await cls._generate_single_event(
                pet, current_region, current_mood, current_energy, inventory
            )
            events.append(event)

            current_region = event.get("location", current_region)
            current_mood = max(0, min(100, current_mood + event.get("mood_change", 0)))
            current_energy = max(0, min(100, current_energy + event.get("energy_change", 0)))

            if event.get("items_found"):
                inventory.extend(event["items_found"])

        return events

    @classmethod
    async def _generate_single_event(
        cls, pet: Pet, current_region: str, mood: float, energy: float, inventory: List[str]
    ) -> Dict:
        event_type = cls._decide_event_type(mood, energy)

        if event_type == "explore":
            return cls._generate_explore_event(current_region)
        elif event_type == "discover":
            return cls._generate_discover_event(current_region)
        elif event_type == "rest":
            return cls._generate_rest_event(current_region)
        elif event_type == "collect":
            return cls._generate_collect_event(current_region)
        elif event_type == "social":
            return cls._generate_social_event(current_region)
        elif event_type == "move":
            return cls._generate_move_event(current_region)

        return cls._generate_explore_event(current_region)

    @classmethod
    def _decide_event_type(cls, mood: float, energy: float) -> str:
        if energy < 20:
            return "rest"
        elif mood < 30:
            return random.choices(["collect", "social"], weights=[0.6, 0.4])[0]
        elif energy < 40:
            return random.choices(["explore", "rest"], weights=[0.5, 0.5])[0]
        else:
            rand = random.random()
            if rand < 0.4:
                return "explore"
            elif rand < 0.6:
                return "discover"
            elif rand < 0.75:
                return "collect"
            elif rand < 0.9:
                return "social"
            else:
                return "move"

    @classmethod
    def _generate_explore_event(cls, current_region: str) -> Dict:
        return {
            "event_type": "explore",
            "location": current_region,
            "detail": f"在{REGION_NAMES.get(current_region, current_region)}探索了一番",
            "mood_change": 5,
            "energy_change": -10,
            "items_found": [],
        }

    @classmethod
    def _generate_discover_event(cls, current_region: str) -> Dict:
        detail_options = [
            f"在{REGION_NAMES.get(current_region, current_region)}发现了一处神秘景观",
            f"在{REGION_NAMES.get(current_region, current_region)}发现了古老的遗迹",
            f"在{REGION_NAMES.get(current_region, current_region)}发现了发光的植物",
            f"在{REGION_NAMES.get(current_region, current_region)}发现了隐藏的洞穴入口",
        ]
        return {
            "event_type": "discover",
            "location": current_region,
            "detail": random.choice(detail_options),
            "mood_change": 10,
            "energy_change": -5,
            "items_found": [random.choice(ITEMS)],
        }

    @classmethod
    def _generate_rest_event(cls, current_region: str) -> Dict:
        detail_options = [
            f"在{REGION_NAMES.get(current_region, current_region)}找了一个舒适的地方休息",
            f"在{REGION_NAMES.get(current_region, current_region)}打了个盹",
            f"在{REGION_NAMES.get(current_region, current_region)}小憩片刻恢复精力",
        ]
        return {
            "event_type": "rest",
            "location": current_region,
            "detail": random.choice(detail_options),
            "mood_change": 3,
            "energy_change": 20,
            "items_found": [],
        }

    @classmethod
    def _generate_collect_event(cls, current_region: str) -> Dict:
        found_items = random.sample(ITEMS, random.randint(1, 2))
        return {
            "event_type": "collect",
            "location": current_region,
            "detail": f"在{REGION_NAMES.get(current_region, current_region)}收集到了{','.join(found_items)}",
            "mood_change": 8,
            "energy_change": -8,
            "items_found": found_items,
        }

    @classmethod
    def _generate_social_event(cls, current_region: str) -> Dict:
        detail_options = [
            f"在{REGION_NAMES.get(current_region, current_region)}遇到了另一只星灵宠物",
            f"在{REGION_NAMES.get(current_region, current_region)}和朋友一起玩耍",
            f"在{REGION_NAMES.get(current_region, current_region)}和其他宠物交换了物品",
            f"在{REGION_NAMES.get(current_region, current_region)}参加了一场小型聚会",
        ]
        return {
            "event_type": "social",
            "location": current_region,
            "detail": random.choice(detail_options),
            "mood_change": 15,
            "energy_change": -5,
            "items_found": ["友谊徽章"] if random.random() > 0.5 else [],
        }

    @classmethod
    def _generate_move_event(cls, current_region: str) -> Dict:
        new_region = random.choice([r for r in REGIONS if r != current_region])
        return {
            "event_type": "move",
            "location": new_region,
            "detail": f"从{REGION_NAMES.get(current_region, current_region)}移动到了{REGION_NAMES.get(new_region, new_region)}",
            "mood_change": 3,
            "energy_change": -5,
            "items_found": [],
        }

    @classmethod
    async def sync_offline_events(cls, pet_id: str, last_online_time: datetime) -> Dict:
        async for session in get_db():
            result = await session.execute(select(Pet).filter(Pet.id == pet_id))
            pet = result.scalar_one_or_none()

            if not pet:
                return {"error": "Pet not found"}

            offline_duration = await cls.calculate_offline_duration(last_online_time)

            if offline_duration < cls.MIN_OFFLINE_SECONDS:
                return {
                    "pet_id": pet_id,
                    "offline_duration": offline_duration,
                    "events_generated": 0,
                    "current_status": cls._get_pet_status(pet),
                    "events": [],
                }

            tick_count = min(
                offline_duration // cls.SECONDS_PER_TICK,
                cls.MAX_EVENTS_PER_SYNC,
            )

            events = await cls.generate_tick_events(pet, tick_count)

            await cls._save_events(session, pet_id, events)
            await cls._update_pet_state(session, pet, events)

            return {
                "pet_id": pet_id,
                "offline_duration": offline_duration,
                "events_generated": len(events),
                "current_status": cls._get_pet_status(pet),
                "events": events,
            }

    @classmethod
    async def _save_events(cls, session: AsyncSession, pet_id: str, events: List[Dict]):
        for idx, event_data in enumerate(events):
            event_id = f"event_{pet_id}_{int(datetime.now().timestamp())}_{idx}"
            event = PetEvent(
                id=event_id,
                pet_id=pet_id,
                event_type=event_data["event_type"],
                location=event_data["location"],
                detail=event_data["detail"],
                mood_change=event_data["mood_change"],
                energy_change=event_data["energy_change"],
                items_found=event_data["items_found"],
            )
            session.add(event)
        await session.commit()

    @classmethod
    async def _update_pet_state(cls, session: AsyncSession, pet: Pet, events: List[Dict]):
        for event in events:
            pet.mood = max(0, min(100, pet.mood + event.get("mood_change", 0)))
            pet.energy = max(0, min(100, pet.energy + event.get("energy_change", 0)))
            pet.current_region = event.get("location", pet.current_region)

            if event.get("items_found"):
                if pet.inventory is None:
                    pet.inventory = []
                pet.inventory.extend(event["items_found"])

        pet.last_active = datetime.now()
        await session.commit()

    @classmethod
    def _get_pet_status(cls, pet: Pet) -> Dict:
        return {
            "mood": pet.mood,
            "energy": pet.energy,
            "location": pet.current_region,
            "inventory": pet.inventory or [],
        }

    @classmethod
    async def get_pet_events(cls, pet_id: str, limit: int = 20) -> List[Dict]:
        async for session in get_db():
            result = await session.execute(
                select(PetEvent)
                .filter(PetEvent.pet_id == pet_id)
                .order_by(PetEvent.timestamp.desc())
                .limit(limit)
            )
            events = result.scalars().all()

            return [
                {
                    "id": e.id,
                    "event_type": e.event_type,
                    "location": e.location,
                    "detail": e.detail,
                    "timestamp": e.timestamp.isoformat() if e.timestamp else None,
                    "mood_change": e.mood_change,
                    "energy_change": e.energy_change,
                    "items_found": e.items_found or [],
                }
                for e in events
            ]
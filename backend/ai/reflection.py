import time
from datetime import datetime
from typing import List, Dict, Optional

try:
    from sqlalchemy import select, desc
    from db.database import get_db
    from models.observation import Observation
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False

REFLECTION_QUESTIONS = [
    "从最近的观察中，我发现了什么模式？",
    "我学到了什么新东西？",
    "我应该改变什么行为？",
    "我未来应该追求什么目标？",
]

MIN_OBSERVATIONS_FOR_REFLECTION = 10
MIN_HOURS_BETWEEN_REFLECTIONS = 4
IMPORTANT_EVENT_IMPORTANCE = 0.8


class ReflectionEngine:
    def __init__(self, pet_id: str):
        self.pet_id = pet_id
        self.last_reflection_time = 0

    async def should_reflect(self) -> bool:
        if time.time() - self.last_reflection_time < MIN_HOURS_BETWEEN_REFLECTIONS * 3600:
            return False

        count = await self._get_observation_count()
        if count >= MIN_OBSERVATIONS_FOR_REFLECTION:
            return True

        has_important = await self._has_important_event()
        return has_important

    async def _get_observation_count(self) -> int:
        if not HAS_SQLALCHEMY:
            return 0

        async for session in get_db():
            cutoff_time = datetime.fromtimestamp(time.time() - MIN_HOURS_BETWEEN_REFLECTIONS * 3600)
            result = await session.execute(
                select(Observation)
                .filter(Observation.pet_id == self.pet_id)
                .filter(Observation.created_at >= cutoff_time)
            )
            return len(result.scalars().all())

    async def _has_important_event(self) -> bool:
        if not HAS_SQLALCHEMY:
            return False

        async for session in get_db():
            result = await session.execute(
                select(Observation)
                .filter(Observation.pet_id == self.pet_id)
                .filter(Observation.importance >= IMPORTANT_EVENT_IMPORTANCE)
                .order_by(desc(Observation.created_at))
                .limit(1)
            )
            return result.scalar_one_or_none() is not None

    async def reflect(self) -> Dict:
        observations = await self._get_recent_observations()
        
        if not observations:
            return {
                "summary": "最近没有什么特别的事情发生。",
                "insights": [],
                "learnings": [],
                "goals": [],
            }

        insights = self._extract_insights(observations)
        learnings = self._extract_learnings(observations)
        goals = self._generate_goals(observations, insights)

        self.last_reflection_time = time.time()

        return {
            "summary": self._generate_summary(observations, insights),
            "insights": insights,
            "learnings": learnings,
            "goals": goals,
            "timestamp": time.time(),
        }

    async def _get_recent_observations(self, limit: int = 20) -> List[Dict]:
        if not HAS_SQLALCHEMY:
            return []

        async for session in get_db():
            result = await session.execute(
                select(Observation)
                .filter(Observation.pet_id == self.pet_id)
                .order_by(desc(Observation.created_at))
                .limit(limit)
            )
            obs_list = result.scalars().all()
            return [
                {
                    "type": obs.type,
                    "content": obs.content,
                    "importance": obs.importance,
                    "context": obs.context,
                    "created_at": obs.created_at.timestamp(),
                }
                for obs in obs_list
            ]

    def _extract_insights(self, observations: List[Dict]) -> List[str]:
        insights = []
        
        weather_obs = [o for o in observations if o["type"] == "weather"]
        if len(weather_obs) >= 2:
            weather_patterns = {}
            for obs in weather_obs:
                weather = obs["context"].get("weather", "")
                weather_patterns[weather] = weather_patterns.get(weather, 0) + 1
            if weather_patterns:
                most_common = max(weather_patterns, key=weather_patterns.get)
                insights.append(f"最近{most_common}天气比较多")

        item_obs = [o for o in observations if o["type"] == "item"]
        if item_obs:
            items = [o["context"].get("item", "") for o in item_obs]
            insights.append(f"最近发现了{len(items)}个物品")

        pet_obs = [o for o in observations if o["type"] == "pet"]
        if pet_obs:
            pets = set(o["context"].get("pet_name", "") for o in pet_obs)
            insights.append(f"遇到了{len(pets)}种不同的宠物")

        return insights

    def _extract_learnings(self, observations: List[Dict]) -> List[str]:
        learnings = []

        item_obs = [o for o in observations if o["type"] == "item"]
        for obs in item_obs:
            item = obs["context"].get("item", "")
            rarity = obs["context"].get("rarity", "common")
            if rarity == "rare":
                learnings.append(f"{item}是稀有的物品")

        event_obs = [o for o in observations if o["type"] == "event"]
        for obs in event_obs:
            event_type = obs["context"].get("event_type", "")
            if "洞穴" in event_type:
                learnings.append("森林里有神秘的洞穴可以探索")
            if "彩虹" in event_type:
                learnings.append("雨后可能会出现彩虹")

        return learnings

    def _generate_goals(self, observations: List[Dict], insights: List[str]) -> List[str]:
        goals = []

        explore_obs = [o for o in observations if o["type"] == "location"]
        if len(explore_obs) < 3:
            goals.append("去更多地方探索")

        pet_obs = [o for o in observations if o["type"] == "pet"]
        if len(pet_obs) < 2:
            goals.append("多认识一些新朋友")

        item_obs = [o for o in observations if o["type"] == "item"]
        if any(o["context"].get("rarity") == "rare" for o in item_obs):
            goals.append("寻找更多稀有物品")

        return goals

    def _generate_summary(self, observations: List[Dict], insights: List[str]) -> str:
        if not insights:
            return "今天过得很充实，虽然没有特别的发现，但心情不错。"

        summary_parts = ["今天我发现了一些有趣的事情："]
        summary_parts.extend(f"- {insight}" for insight in insights)

        high_importance = [o for o in observations if o["importance"] >= 0.7]
        if high_importance:
            summary_parts.append("\n最重要的事情是：")
            summary_parts.append(f"- {high_importance[0]['content']}")

        return "\n".join(summary_parts)

    async def get_reflection_history(self, limit: int = 10) -> List[Dict]:
        return []


async def trigger_reflection(pet_id: str) -> Dict:
    engine = ReflectionEngine(pet_id)
    return await engine.reflect()


async def should_reflect(pet_id: str) -> bool:
    engine = ReflectionEngine(pet_id)
    return await engine.should_reflect()


async def get_reflection(pet_id: str) -> Dict:
    engine = ReflectionEngine(pet_id)
    return await engine.reflect()
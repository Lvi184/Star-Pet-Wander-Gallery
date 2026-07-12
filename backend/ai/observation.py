import random
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

OBSERVATION_TYPES = ["weather", "location", "pet", "item", "event", "status"]

WEATHER_CONDITIONS = [
    ("晴朗", 0.6),
    ("多云", 0.2),
    ("下雨", 0.15),
    ("刮风", 0.05),
]

LOCATION_EVENTS = [
    ("到达星光森林", 0.3),
    ("到达月影湖", 0.25),
    ("到达水晶洞穴", 0.2),
    ("到达彩虹草原", 0.15),
    ("到达迷雾山脉", 0.1),
]

PET_ENCOUNTERS = [
    ("小星猫", 0.3),
    ("月兔", 0.25),
    ("火焰狐", 0.2),
    ("水晶鹿", 0.15),
    ("云雀", 0.1),
]

ITEM_DISCOVERIES = [
    ("星星碎片", 0.3),
    ("月光石", 0.25),
    ("彩虹花", 0.2),
    ("水晶碎片", 0.15),
    ("魔法果实", 0.1),
]

EVENT_TYPES = [
    ("遇到下雨", 0.3),
    ("发现神秘洞穴", 0.25),
    ("听到奇怪的声音", 0.2),
    ("看到彩虹", 0.15),
    ("遇到迷路的小动物", 0.1),
]

STATUS_CHANGES = [
    ("精力下降了", 0.4),
    ("心情变好了", 0.3),
    ("肚子饿了", 0.2),
    ("感觉很开心", 0.1),
]


class ObservationAgent:
    def __init__(self, pet_id: str):
        self.pet_id = pet_id
        self.last_observation_time = 0

    async def generate_observation(self) -> Optional[Dict]:
        if time.time() - self.last_observation_time < 60:
            return None

        obs_type = random.choices(OBSERVATION_TYPES, weights=[0.2, 0.2, 0.15, 0.15, 0.15, 0.15])[0]
        self.last_observation_time = time.time()

        observations = {
            "weather": self._generate_weather_observation,
            "location": self._generate_location_observation,
            "pet": self._generate_pet_observation,
            "item": self._generate_item_observation,
            "event": self._generate_event_observation,
            "status": self._generate_status_observation,
        }

        return observations[obs_type]()

    def _generate_weather_observation(self) -> Dict:
        weather, prob = random.choices(WEATHER_CONDITIONS, weights=[w[1] for w in WEATHER_CONDITIONS])[0]
        return {
            "type": "weather",
            "content": f"天气{weather}了",
            "importance": 0.5 + prob,
            "context": {"weather": weather},
        }

    def _generate_location_observation(self) -> Dict:
        location, prob = random.choices(LOCATION_EVENTS, weights=[w[1] for w in LOCATION_EVENTS])[0]
        return {
            "type": "location",
            "content": location,
            "importance": 0.6 + prob,
            "context": {"location": location.replace("到达", "")},
        }

    def _generate_pet_observation(self) -> Dict:
        pet_name, prob = random.choices(PET_ENCOUNTERS, weights=[w[1] for w in PET_ENCOUNTERS])[0]
        return {
            "type": "pet",
            "content": f"看到了{pet_name}",
            "importance": 0.7 + prob,
            "context": {"pet_name": pet_name, "action": "meet"},
        }

    def _generate_item_observation(self) -> Dict:
        item, prob = random.choices(ITEM_DISCOVERIES, weights=[w[1] for w in ITEM_DISCOVERIES])[0]
        return {
            "type": "item",
            "content": f"发现了{item}",
            "importance": 0.6 + prob * 0.5,
            "context": {"item": item, "rarity": "rare" if prob < 0.15 else "common"},
        }

    def _generate_event_observation(self) -> Dict:
        event, prob = random.choices(EVENT_TYPES, weights=[w[1] for w in EVENT_TYPES])[0]
        return {
            "type": "event",
            "content": event,
            "importance": 0.5 + prob * 0.5,
            "context": {"event_type": event},
        }

    def _generate_status_observation(self) -> Dict:
        status, prob = random.choices(STATUS_CHANGES, weights=[w[1] for w in STATUS_CHANGES])[0]
        return {
            "type": "status",
            "content": status,
            "importance": 0.4 + prob,
            "context": {"status": status},
        }

    async def save_observation(self, observation: Dict) -> Optional[int]:
        if not HAS_SQLALCHEMY:
            return None

        async for session in get_db():
            db_obs = Observation(
                pet_id=self.pet_id,
                type=observation["type"],
                content=observation["content"],
                importance=observation["importance"],
                context=observation.get("context", {}),
            )
            session.add(db_obs)
            await session.commit()
            return db_obs.id

    async def get_recent_observations(self, limit: int = 20) -> List[Dict]:
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
                    "id": obs.id,
                    "type": obs.type,
                    "content": obs.content,
                    "importance": obs.importance,
                    "context": obs.context,
                    "created_at": obs.created_at.timestamp(),
                }
                for obs in obs_list
            ]

    async def get_observation_count(self, hours: int = 24) -> int:
        if not HAS_SQLALCHEMY:
            return 0

        async for session in get_db():
            cutoff_time = datetime.fromtimestamp(time.time() - hours * 3600)
            result = await session.execute(
                select(func.count(Observation.id))
                .filter(Observation.pet_id == self.pet_id)
                .filter(Observation.created_at >= cutoff_time)
            )
            return result.scalar() or 0


async def create_observation(pet_id: str, obs_type: str, content: str, importance: float = 0.5, context: Dict = None) -> Dict:
    agent = ObservationAgent(pet_id)
    observation = {
        "type": obs_type,
        "content": content,
        "importance": importance,
        "context": context or {},
    }
    obs_id = await agent.save_observation(observation)
    return {**observation, "id": obs_id, "pet_id": pet_id}


async def get_observations(pet_id: str, limit: int = 20) -> List[Dict]:
    agent = ObservationAgent(pet_id)
    return await agent.get_recent_observations(limit)


async def get_latest_observation(pet_id: str) -> Optional[Dict]:
    observations = await get_observations(pet_id, limit=1)
    return observations[0] if observations else None


async def generate_and_save_observation(pet_id: str) -> Optional[Dict]:
    agent = ObservationAgent(pet_id)
    observation = await agent.generate_observation()
    if observation:
        obs_id = await agent.save_observation(observation)
        return {**observation, "id": obs_id, "pet_id": pet_id}
    return None
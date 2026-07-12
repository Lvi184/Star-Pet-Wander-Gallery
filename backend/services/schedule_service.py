import random
from datetime import datetime, date
from typing import List, Dict, Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import async_session
from models.schedule import DailySchedule
from models.pet import Pet


SCHEDULE_TIME_SLOTS = [
    {"start": 6, "end": 10, "activity": "explore", "weight": 0.7, "name": "早晨探索"},
    {"start": 10, "end": 14, "activity": "social", "weight": 0.5, "name": "上午社交"},
    {"start": 14, "end": 18, "activity": "explore", "weight": 0.6, "name": "下午探索"},
    {"start": 18, "end": 22, "activity": "rest", "weight": 0.8, "name": "晚上休息"},
    {"start": 22, "end": 24, "activity": "sleep", "weight": 0.95, "name": "深度睡眠"},
    {"start": 0, "end": 6, "activity": "sleep", "weight": 0.95, "name": "深度睡眠"},
]


class ScheduleService:
    @classmethod
    def get_current_time_slot(cls, hour: int) -> Dict:
        for slot in SCHEDULE_TIME_SLOTS:
            if slot["start"] <= hour < slot["end"]:
                return slot
            elif slot["start"] == 22 and hour >= 22:
                return slot
            elif slot["start"] == 0 and hour < 6:
                return slot
        return SCHEDULE_TIME_SLOTS[0]

    @classmethod
    def adjust_probability_by_state(cls, base_weight: float, energy: float, mood: float) -> float:
        energy_factor = min(energy / 50, 1.0)
        mood_factor = min(mood / 50, 1.0)
        return base_weight * (energy_factor * 0.5 + mood_factor * 0.5 + 0.5)

    @classmethod
    def decide_activity(cls, hour: int, energy: float, mood: float) -> str:
        time_slot = cls.get_current_time_slot(hour)
        base_activity = time_slot["activity"]
        base_weight = time_slot["weight"]

        if base_activity == "sleep":
            return "sleep"

        adjusted_weight = cls.adjust_probability_by_state(base_weight, energy, mood)

        rand = random.random()
        if rand < adjusted_weight:
            return base_activity
        else:
            alternatives = []
            if base_activity != "explore":
                alternatives.append(("explore", 0.3))
            if base_activity != "social" and mood > 30:
                alternatives.append(("social", 0.2))
            if base_activity != "rest" and energy < 50:
                alternatives.append(("rest", 0.3))
            if base_activity != "collect":
                alternatives.append(("collect", 0.2))

            if alternatives:
                activities, weights = zip(*alternatives)
                return random.choices(activities, weights=weights)[0]
            else:
                return "explore"

    @classmethod
    def generate_daily_schedule(cls, pet: Pet) -> List[Dict]:
        schedule = []
        today = date.today()

        for hour in range(24):
            time_slot = cls.get_current_time_slot(hour)
            activity = cls.decide_activity(hour, pet.energy, pet.mood)

            schedule.append({
                "hour": hour,
                "time_slot": time_slot["name"],
                "activity": activity,
                "probability": cls.adjust_probability_by_state(time_slot["weight"], pet.energy, pet.mood),
            })

        return schedule

    @classmethod
    async def _save_schedule_internal(cls, session: AsyncSession, pet_id: str, activities: List[Dict]):
        today = date.today()
        
        result = await session.execute(
            select(DailySchedule).filter(
                DailySchedule.pet_id == pet_id,
                DailySchedule.date == today
            )
        )
        existing = result.scalar_one_or_none()

        if existing:
            existing.activities = activities
        else:
            new_schedule = DailySchedule(
                pet_id=pet_id,
                date=today,
                activities=activities,
            )
            session.add(new_schedule)

    @classmethod
    async def save_schedule(cls, pet_id: str, activities: List[Dict], session: AsyncSession = None):
        if session:
            await cls._save_schedule_internal(session, pet_id, activities)
        else:
            async with async_session as s:
                await cls._save_schedule_internal(s, pet_id, activities)
                await s.commit()

    @classmethod
    async def get_schedule(cls, pet_id: str, target_date: Optional[date] = None) -> Optional[DailySchedule]:
        if target_date is None:
            target_date = date.today()

        async with async_session as session:
            result = await session.execute(
                select(DailySchedule).filter(
                    DailySchedule.pet_id == pet_id,
                    DailySchedule.date == target_date
                )
            )
            return result.scalar_one_or_none()

    @classmethod
    async def generate_and_save_schedule(cls, pet_id: str) -> Dict:
        async with async_session as session:
            result = await session.execute(select(Pet).filter(Pet.id == pet_id))
            pet = result.scalar_one_or_none()

            if not pet:
                return {"error": "Pet not found"}

            activities = cls.generate_daily_schedule(pet)
            await cls._save_schedule_internal(session, pet_id, activities)
            await session.commit()

            return {
                "pet_id": pet_id,
                "date": date.today().isoformat(),
                "activities": activities,
            }

    @classmethod
    def get_sleep_recovery(cls, hours: int) -> Dict:
        return {
            "energy_recovery": hours * 20,
            "mood_recovery": hours * 5,
        }

    @classmethod
    def is_deep_sleep_time(cls, hour: int) -> bool:
        return hour >= 22 or hour < 6
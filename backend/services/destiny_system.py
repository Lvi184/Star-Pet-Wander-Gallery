from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.destiny import DestinyRecord
from datetime import datetime, date
import random


class DestinySystem:
    FATE_LEVELS = ["normal", "lucky", "dangerous", "disaster"]
    FATE_PROBABILITIES = {
        "normal": 0.50,
        "lucky": 0.25,
        "dangerous": 0.20,
        "disaster": 0.05
    }

    def __init__(self, db: AsyncSession):
        self.db = db

    async def generate_daily_fate(self) -> dict:
        today = date.today()
        regions = ["qingqiu", "kunlun", "donghai", "lingxu", "youdu", "xinghai"]
        results = {}

        for region_id in regions:
            existing = await self.db.execute(
                select(DestinyRecord).where(
                    DestinyRecord.region_id == region_id,
                    DestinyRecord.date >= datetime(today.year, today.month, today.day)
                )
            )
            if existing.scalar_one_or_none():
                continue

            fate_level = self._roll_fate()
            effect = self._generate_effect(fate_level)

            record = DestinyRecord(
                id=DestinyRecord.generate_id(),
                region_id=region_id,
                date=datetime.now(),
                fate_level=fate_level,
                effect=effect
            )
            self.db.add(record)
            results[region_id] = fate_level

        await self.db.commit()
        return results

    def _roll_fate(self) -> str:
        r = random.random()
        cumulative = 0
        for level, prob in self.FATE_PROBABILITIES.items():
            cumulative += prob
            if r < cumulative:
                return level
        return "normal"

    def _generate_effect(self, fate_level: str) -> dict:
        effects = {
            "normal": {"description": "平静的一天", "risk_modifier": 1.0, "reward_modifier": 1.0},
            "lucky": {"description": "好运降临", "risk_modifier": 0.7, "reward_modifier": 1.5},
            "dangerous": {"description": "危险潜伏", "risk_modifier": 1.5, "reward_modifier": 1.2},
            "disaster": {"description": "灾难将至", "risk_modifier": 2.5, "reward_modifier": 2.0}
        }
        return effects.get(fate_level, effects["normal"])

    async def get_region_fate(self, region_id: str) -> str:
        today = date.today()
        result = await self.db.execute(
            select(DestinyRecord).where(
                DestinyRecord.region_id == region_id,
                DestinyRecord.date >= datetime(today.year, today.month, today.day)
            )
        )
        record = result.scalar_one_or_none()
        return record.fate_level if record else "normal"

    async def get_all_fates(self) -> dict:
        today = date.today()
        results = await self.db.execute(
            select(DestinyRecord).where(
                DestinyRecord.date >= datetime(today.year, today.month, today.day)
            )
        )
        records = results.scalars().all()
        return {r.region_id: r.fate_level for r in records}

    def is_fate_visible_to_player(self) -> bool:
        return True

    def is_fate_visible_to_planner(self) -> bool:
        return False
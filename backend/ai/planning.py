import random
import time
from datetime import datetime, timedelta
from typing import List, Dict, Optional

try:
    from sqlalchemy import select, desc, func
    from db.database import get_db
    from models.plan import Plan
    HAS_SQLALCHEMY = True
except ImportError:
    HAS_SQLALCHEMY = False


class PlanningEngine:
    def __init__(self, pet_id: str):
        self.pet_id = pet_id

    async def create_plan(self, goal: str, level: str = "daily", steps: List[str] = None, priority: float = 0.5) -> Dict:
        plan_id = f"plan_{self.pet_id}_{int(time.time())}"
        plan_data = {
            "id": plan_id,
            "pet_id": self.pet_id,
            "level": level,
            "goal": goal,
            "steps": steps or [],
            "current_step": 0,
            "status": "active",
            "priority": priority,
        }

        if HAS_SQLALCHEMY:
            async for session in get_db():
                db_plan = Plan(**plan_data)
                session.add(db_plan)
                await session.commit()

        return plan_data

    async def get_current_plan(self) -> Optional[Dict]:
        if not HAS_SQLALCHEMY:
            return None

        async for session in get_db():
            result = await session.execute(
                select(Plan)
                .filter(Plan.pet_id == self.pet_id)
                .filter(Plan.status == "active")
                .order_by(desc(Plan.priority))
                .order_by(desc(Plan.created_at))
                .limit(1)
            )
            plan = result.scalar_one_or_none()
            if plan:
                return {
                    "id": plan.id,
                    "pet_id": plan.pet_id,
                    "level": plan.level,
                    "goal": plan.goal,
                    "steps": plan.steps,
                    "current_step": plan.current_step,
                    "status": plan.status,
                    "priority": plan.priority,
                    "created_at": plan.created_at.timestamp(),
                }
        return None

    async def get_plans(self, level: str = None) -> List[Dict]:
        if not HAS_SQLALCHEMY:
            return []

        async for session in get_db():
            query = select(Plan).filter(Plan.pet_id == self.pet_id)
            if level:
                query = query.filter(Plan.level == level)
            result = await session.execute(query.order_by(desc(Plan.created_at)))
            plans = result.scalars().all()
            return [
                {
                    "id": plan.id,
                    "pet_id": plan.pet_id,
                    "level": plan.level,
                    "goal": plan.goal,
                    "steps": plan.steps,
                    "current_step": plan.current_step,
                    "status": plan.status,
                    "priority": plan.priority,
                    "created_at": plan.created_at.timestamp(),
                }
                for plan in plans
            ]

    async def update_plan(self, plan_id: str, **kwargs) -> Optional[Dict]:
        if not HAS_SQLALCHEMY:
            return None

        async for session in get_db():
            result = await session.execute(
                select(Plan).filter(Plan.id == plan_id)
            )
            plan = result.scalar_one_or_none()
            if plan:
                for key, value in kwargs.items():
                    if hasattr(plan, key):
                        setattr(plan, key, value)
                await session.commit()
                return {
                    "id": plan.id,
                    "pet_id": plan.pet_id,
                    "level": plan.level,
                    "goal": plan.goal,
                    "steps": plan.steps,
                    "current_step": plan.current_step,
                    "status": plan.status,
                    "priority": plan.priority,
                    "created_at": plan.created_at.timestamp(),
                }
        return None

    async def complete_step(self, plan_id: str) -> bool:
        plan = await self.update_plan(plan_id)
        if plan and plan["status"] == "active":
            steps = plan["steps"]
            current_step = plan["current_step"]
            if current_step < len(steps) - 1:
                await self.update_plan(plan_id, current_step=current_step + 1)
            else:
                await self.update_plan(plan_id, status="completed", current_step=len(steps))
            return True
        return False

    async def generate_daily_plan(self, memories: List[Dict], reflections: List[Dict], energy: float, mood: float) -> Dict:
        exploration_desire = 0.5 + (mood / 200)
        rest_desire = 0.5 + ((100 - energy) / 200)
        social_desire = 0.3 + (mood / 300)

        weights = {
            "explore": exploration_desire,
            "rest": rest_desire,
            "social": social_desire,
        }

        main_activity = max(weights, key=weights.get)

        goals = {
            "explore": "今天去探险",
            "rest": "今天好好休息",
            "social": "今天去交朋友",
        }

        steps = {
            "explore": ["出发去探险", "探索新区域", "收集物品", "返回"],
            "rest": ["找个舒服的地方", "小憩一下", "恢复精力"],
            "social": ["寻找其他宠物", "打招呼", "一起玩耍"],
        }

        plan = await self.create_plan(
            goal=goals[main_activity],
            level="daily",
            steps=steps[main_activity],
            priority=weights[main_activity],
        )

        return plan

    async def generate_hourly_plan(self, daily_plan: Dict, current_hour: int) -> Dict:
        if not daily_plan or daily_plan["status"] != "active":
            return await self.create_plan(
                goal="自由活动",
                level="hourly",
                steps=["看看周围", "做些有趣的事"],
            )

        steps = daily_plan.get("steps", [])
        current_step = daily_plan.get("current_step", 0)

        if current_step < len(steps):
            return await self.create_plan(
                goal=steps[current_step],
                level="hourly",
                priority=daily_plan["priority"],
            )

        return await self.create_plan(
            goal="完成今日计划",
            level="hourly",
            priority=0.8,
        )


async def create_plan(pet_id: str, goal: str, level: str = "daily", steps: List[str] = None, priority: float = 0.5) -> Dict:
    engine = PlanningEngine(pet_id)
    return await engine.create_plan(goal, level, steps, priority)


async def get_current_plan(pet_id: str) -> Optional[Dict]:
    engine = PlanningEngine(pet_id)
    return await engine.get_current_plan()


async def get_plans(pet_id: str, level: str = None) -> List[Dict]:
    engine = PlanningEngine(pet_id)
    return await engine.get_plans(level)


async def update_plan(pet_id: str, plan_id: str, **kwargs) -> Optional[Dict]:
    engine = PlanningEngine(pet_id)
    return await engine.update_plan(plan_id, **kwargs)


async def generate_daily_plan(pet_id: str, memories: List[Dict], reflections: List[Dict], energy: float, mood: float) -> Dict:
    engine = PlanningEngine(pet_id)
    return await engine.generate_daily_plan(memories, reflections, energy, mood)
from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from services.action_resolver import ActionResolver, ActionInput, ActionResult
from typing import Dict, Optional


class ActionIntent:
    def __init__(self, action_type: str, target: Optional[str] = None,
                 reason: str = "", risk_tolerance: float = 0.5,
                 expected_duration: int = 30):
        self.action_type = action_type
        self.target = target
        self.reason = reason
        self.risk_tolerance = risk_tolerance
        self.expected_duration = expected_duration


class AgentController:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.action_resolver = ActionResolver(db)

    async def decide_action(self, character: Character) -> ActionIntent:
        personality = character.personality or {}
        adventure = personality.get("adventure", 50)
        curiosity = personality.get("curiosity", 50)
        energy = character.energy

        if energy < 20:
            return ActionIntent(action_type="rest", reason="精力不足，需要休息")

        if energy < 40:
            return ActionIntent(action_type="rest", reason="精力较低，休息恢复")

        if adventure > 70:
            return ActionIntent(action_type="explore", reason="冒险家性格，喜欢探索")

        if curiosity > 70:
            return ActionIntent(action_type="explore", reason="好奇心强，想去看看")

        return ActionIntent(action_type="explore", reason="日常探索")

    async def execute_action(self, char_id: str, action_intent: ActionIntent) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        action_input = ActionInput(
            char_id=char_id,
            action_type=action_intent.action_type,
            target=action_intent.target,
            kwargs={"reason": action_intent.reason},
            controller_type="agent"
        )

        return await self.action_resolver.resolve(action_input)

    async def run_turn(self, char_id: str) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        if character.controller_type != "agent":
            return ActionResult(success=False, message="当前角色不由AI控制")

        action_intent = await self.decide_action(character)
        return await self.execute_action(char_id, action_intent)
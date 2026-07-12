from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from models.event import PetEvent
from typing import Dict, Any, Optional


class ActionInput:
    def __init__(self, char_id: str, action_type: str, target: Optional[str] = None, 
                 kwargs: Optional[Dict[str, Any]] = None, controller_type: str = "agent"):
        self.char_id = char_id
        self.action_type = action_type
        self.target = target
        self.kwargs = kwargs or {}
        self.controller_type = controller_type


class ActionResult:
    def __init__(self, success: bool, message: str, event_record: Optional[PetEvent] = None,
                 state_changes: Optional[Dict[str, Any]] = None, cause_chain: Optional[list] = None):
        self.success = success
        self.message = message
        self.event_record = event_record
        self.state_changes = state_changes or {}
        self.cause_chain = cause_chain or []


class ActionResolver:
    ACTIONS = ["explore", "collect", "move", "rest", "fight", "social", "cultivate"]

    def __init__(self, db: AsyncSession):
        self.db = db

    async def resolve(self, action: ActionInput) -> ActionResult:
        character = await self.db.get(Character, action.char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        if not self._validate_action(action):
            return ActionResult(success=False, message=f"非法动作类型: {action.action_type}")

        if action.controller_type == "player" and character.controller_type != "player":
            return ActionResult(success=False, message="当前没有控制权")

        cause_chain = []
        state_changes = {}

        if action.action_type == "move":
            result = await self._handle_move(character, action, cause_chain, state_changes)
        elif action.action_type == "explore":
            result = await self._handle_explore(character, action, cause_chain, state_changes)
        elif action.action_type == "collect":
            result = await self._handle_collect(character, action, cause_chain, state_changes)
        elif action.action_type == "rest":
            result = await self._handle_rest(character, action, cause_chain, state_changes)
        else:
            return ActionResult(success=False, message=f"未实现的动作: {action.action_type}")

        if result.success:
            event_record = await self._create_event_record(action, character, cause_chain, state_changes)
            result.event_record = event_record
            result.cause_chain = cause_chain
            await self._update_character_state(character, state_changes)

        return result

    def _validate_action(self, action: ActionInput) -> bool:
        return action.action_type in self.ACTIONS

    async def _handle_move(self, character: Character, action: ActionInput, 
                           cause_chain: list, state_changes: Dict) -> ActionResult:
        target_region = action.kwargs.get("target_region")
        if not target_region:
            return ActionResult(success=False, message="目标区域不能为空")

        cause_chain.append(f"移动到{target_region}")
        
        if character.energy < 10:
            cause_chain.append("精力不足")
            return ActionResult(success=False, message="精力不足，无法移动")

        state_changes["current_region"] = target_region
        state_changes["energy"] = character.energy - 10
        
        return ActionResult(success=True, message=f"移动到{target_region}")

    async def _handle_explore(self, character: Character, action: ActionInput,
                              cause_chain: list, state_changes: Dict) -> ActionResult:
        region = action.kwargs.get("region", character.current_region)
        cause_chain.append(f"探索{region}")

        if character.energy < 15:
            cause_chain.append("精力不足")
            return ActionResult(success=False, message="精力不足，无法探索")

        state_changes["energy"] = character.energy - 15
        
        from services.destiny_system import DestinySystem
        destiny_system = DestinySystem(self.db)
        fate_level = await destiny_system.get_region_fate(region)
        if fate_level in ["dangerous", "disaster"]:
            cause_chain.append(f"区域命运: {fate_level}")

        return ActionResult(success=True, message=f"探索{region}")

    async def _handle_collect(self, character: Character, action: ActionInput,
                              cause_chain: list, state_changes: Dict) -> ActionResult:
        item = action.kwargs.get("item")
        if not item:
            return ActionResult(success=False, message="采集物品不能为空")

        cause_chain.append(f"采集{item}")

        if character.energy < 5:
            cause_chain.append("精力不足")
            return ActionResult(success=False, message="精力不足，无法采集")

        inventory = character.inventory.copy()
        inventory.append(item)
        state_changes["inventory"] = inventory
        state_changes["energy"] = character.energy - 5

        return ActionResult(success=True, message=f"采集到{item}")

    async def _handle_rest(self, character: Character, action: ActionInput,
                           cause_chain: list, state_changes: Dict) -> ActionResult:
        cause_chain.append("休息恢复")
        
        energy_gain = min(30, 100 - character.energy)
        health_gain = min(20, 100 - character.health)
        
        state_changes["energy"] = character.energy + energy_gain
        state_changes["health"] = character.health + health_gain
        
        return ActionResult(success=True, message=f"休息恢复: 精力+{energy_gain}, 生命值+{health_gain}")

    async def _create_event_record(self, action: ActionInput, character: Character,
                                   cause_chain: list, state_changes: Dict) -> PetEvent:
        event = PetEvent(
            id=PetEvent.generate_id(),
            char_id=action.char_id,
            action_type=action.action_type,
            location=character.current_region,
            detail=f"{action.action_type}: {action.target or action.kwargs}",
            cause_chain=cause_chain,
            result=state_changes,
            timestamp=datetime.now()
        )
        self.db.add(event)
        await self.db.flush()
        return event

    async def _update_character_state(self, character: Character, state_changes: Dict):
        for key, value in state_changes.items():
            setattr(character, key, value)
        
        character.last_active = datetime.now()
        await self.db.commit()
        await self.db.refresh(character)
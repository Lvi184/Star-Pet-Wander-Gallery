from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from services.action_resolver import ActionResolver, ActionInput, ActionResult
from datetime import datetime


class PlayerController:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.action_resolver = ActionResolver(db)

    async def handle_input(self, char_id: str, action_type: str, **kwargs) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        if character.controller_type != "player":
            return ActionResult(success=False, message="当前没有控制权")

        action_input = ActionInput(
            char_id=char_id,
            action_type=action_type,
            kwargs=kwargs,
            controller_type="player"
        )

        return await self.action_resolver.resolve(action_input)

    async def move(self, char_id: str, target_region: str) -> ActionResult:
        return await self.handle_input(char_id, "move", target_region=target_region)

    async def explore(self, char_id: str, region: str = None) -> ActionResult:
        return await self.handle_input(char_id, "explore", region=region)

    async def collect(self, char_id: str, item: str) -> ActionResult:
        return await self.handle_input(char_id, "collect", item=item)

    async def rest(self, char_id: str) -> ActionResult:
        return await self.handle_input(char_id, "rest")

    async def heartbeat(self, char_id: str):
        character = await self.db.get(Character, char_id)
        if character:
            character.last_player_heartbeat = datetime.now()
            await self.db.commit()
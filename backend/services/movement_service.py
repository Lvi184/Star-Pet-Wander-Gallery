import random
from typing import Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character


MOVEMENT_SPEED = 0.5
MAP_WIDTH = 45
MAP_HEIGHT = 32


class MovementService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def move_to(self, char_id: str, target_x: float, target_y: float) -> bool:
        character = await self.db.get(Character, char_id)
        if not character:
            return False

        dx = target_x - character.x
        dy = target_y - character.y
        distance = (dx ** 2 + dy ** 2) ** 0.5

        if distance < MOVEMENT_SPEED:
            character.x = target_x
            character.y = target_y
        else:
            character.x += (dx / distance) * MOVEMENT_SPEED
            character.y += (dy / distance) * MOVEMENT_SPEED

        await self.db.commit()
        return True

    async def move_random(self, char_id: str) -> bool:
        character = await self.db.get(Character, char_id)
        if not character:
            return False

        angle = random.uniform(0, 2 * 3.14159)
        new_x = character.x + MOVEMENT_SPEED * 0.5 * (random.random() + 0.5) * (2 if random.random() > 0.5 else -1)
        new_y = character.y + MOVEMENT_SPEED * 0.5 * (random.random() + 0.5) * (2 if random.random() > 0.5 else -1)

        new_x = max(0, min(MAP_WIDTH, new_x))
        new_y = max(0, min(MAP_HEIGHT, new_y))

        character.x = new_x
        character.y = new_y

        await self.db.commit()
        return True

    async def wander(self, char_id: str) -> bool:
        character = await self.db.get(Character, char_id)
        if not character:
            return False

        if not hasattr(character, '_wander_target') or character._wander_target is None:
            character._wander_target = (
                random.uniform(5, MAP_WIDTH - 5),
                random.uniform(5, MAP_HEIGHT - 5)
            )

        target_x, target_y = character._wander_target
        dx = target_x - character.x
        dy = target_y - character.y
        distance = (dx ** 2 + dy ** 2) ** 0.5

        if distance < 1.0:
            character._wander_target = None
            return True
        else:
            character.x += (dx / distance) * MOVEMENT_SPEED
            character.y += (dy / distance) * MOVEMENT_SPEED

        character.x = max(0, min(MAP_WIDTH, character.x))
        character.y = max(0, min(MAP_HEIGHT, character.y))

        await self.db.commit()
        return True

    async def get_position(self, char_id: str) -> Optional[Tuple[float, float]]:
        character = await self.db.get(Character, char_id)
        if not character:
            return None
        return (character.x, character.y)

    async def set_position(self, char_id: str, x: float, y: float) -> bool:
        character = await self.db.get(Character, char_id)
        if not character:
            return False

        character.x = max(0, min(MAP_WIDTH, x))
        character.y = max(0, min(MAP_HEIGHT, y))

        await self.db.commit()
        return True
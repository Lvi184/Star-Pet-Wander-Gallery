from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.rewind import Checkpoint, WorldlineBranch
from models.character import Character
from datetime import datetime, timedelta
import random


class RewindSystem:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def save_checkpoint(self, char_id: str, branch_id: str = None):
        character = await self.db.get(Character, char_id)
        if not character:
            return None

        active_branch = await self._get_active_branch(char_id)
        actual_branch_id = branch_id or active_branch.id if active_branch else None

        snapshot = {
            "health": character.health,
            "energy": character.energy,
            "mood": character.mood,
            "current_region": character.current_region,
            "inventory": character.inventory,
            "status": character.status,
            "controller_type": character.controller_type,
            "controller_version": character.controller_version,
            "spiritual_power": character.spiritual_power,
            "cultivation_level": character.cultivation_level,
            "affinity_map": character.affinity_map,
            "goals": character.goals
        }

        checkpoint = Checkpoint(
            id=Checkpoint.generate_id(),
            char_id=char_id,
            timestamp=datetime.now(),
            state_snapshot=snapshot,
            branch_id=actual_branch_id
        )
        self.db.add(checkpoint)
        await self.db.commit()
        return checkpoint

    async def rewind(self, char_id: str, checkpoint_id: str = None) -> dict:
        if checkpoint_id:
            checkpoint = await self.db.get(Checkpoint, checkpoint_id)
            if not checkpoint:
                return {"success": False, "message": "存档点不存在"}
        else:
            checkpoints = await self.db.execute(
                select(Checkpoint).where(Checkpoint.char_id == char_id).order_by(Checkpoint.timestamp.desc())
            )
            checkpoint = checkpoints.scalars().first()
            if not checkpoint:
                return {"success": False, "message": "没有可用的存档点"}

        character = await self.db.get(Character, char_id)
        if not character:
            return {"success": False, "message": "角色不存在"}

        old_branch = await self._get_active_branch(char_id)
        
        new_branch = WorldlineBranch(
            id=WorldlineBranch.generate_id(),
            char_id=char_id,
            parent_branch_id=old_branch.id if old_branch else None,
            start_time=checkpoint.timestamp,
            seed=random.random()
        )
        self.db.add(new_branch)

        if old_branch:
            old_branch.is_active = "echo"
            old_branch.echo_summary = f"命运回响: {character.name}在{checkpoint.timestamp.strftime('%Y-%m-%d %H:%M')}的命运分支"

        self._restore_from_checkpoint(character, checkpoint)
        character.controller_version += 1
        
        await self.db.commit()

        return {
            "success": True,
            "message": "天道回溯成功",
            "new_branch_id": new_branch.id,
            "checkpoint_time": checkpoint.timestamp.isoformat(),
            "old_branch_echo": old_branch.echo_summary if old_branch else None
        }

    def _restore_from_checkpoint(self, character: Character, checkpoint: Checkpoint):
        snapshot = checkpoint.state_snapshot
        character.health = snapshot.get("health", 100.0)
        character.energy = snapshot.get("energy", 80.0)
        character.mood = snapshot.get("mood", 50.0)
        character.current_region = snapshot.get("current_region")
        character.inventory = snapshot.get("inventory", [])
        character.status = snapshot.get("status", "normal")
        character.controller_type = snapshot.get("controller_type", "agent")
        character.spiritual_power = snapshot.get("spiritual_power", 0.0)
        character.cultivation_level = snapshot.get("cultivation_level", 1)
        character.affinity_map = snapshot.get("affinity_map", {})
        character.goals = snapshot.get("goals", [])

    async def _get_active_branch(self, char_id: str) -> WorldlineBranch:
        result = await self.db.execute(
            select(WorldlineBranch).where(
                WorldlineBranch.char_id == char_id,
                WorldlineBranch.is_active == "active"
            )
        )
        return result.scalar_one_or_none()

    async def get_checkpoints(self, char_id: str) -> list:
        results = await self.db.execute(
            select(Checkpoint).where(Checkpoint.char_id == char_id).order_by(Checkpoint.timestamp.desc())
        )
        return [c.to_dict() for c in results.scalars().all()]

    async def get_worldline_branches(self, char_id: str) -> list:
        results = await self.db.execute(
            select(WorldlineBranch).where(WorldlineBranch.char_id == char_id).order_by(WorldlineBranch.created_at.desc())
        )
        return [b.to_dict() for b in results.scalars().all()]
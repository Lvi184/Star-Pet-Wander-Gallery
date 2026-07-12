from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db
from models.character import Character
from models.event import PetEvent
from controllers.player_controller import PlayerController
from controllers.agent_controller import AgentController
from services.destiny_system import DestinySystem
from services.rewind_system import RewindSystem
from services.death_system import DeathSystem
from datetime import datetime
from typing import Dict, Any

router = APIRouter(prefix="/character", tags=["角色"])


@router.get("/{char_id}/status")
async def get_character_status(char_id: str, db: AsyncSession = Depends(get_db)):
    character = await db.get(Character, char_id)
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")
    return character.to_dict()


@router.post("/{char_id}/action")
async def perform_action(char_id: str, action_data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    action_type = action_data.get("action_type")
    if not action_type:
        raise HTTPException(status_code=400, detail="action_type不能为空")

    controller_type = action_data.get("controller_type", "player")
    
    if controller_type == "player":
        controller = PlayerController(db)
    else:
        controller = AgentController(db)
    
    result = await controller.handle_input(char_id, action_type, **action_data.get("kwargs", {}))
    
    if result.success:
        return {
            "success": True,
            "message": result.message,
            "event_record": result.event_record.to_dict() if result.event_record else None,
            "cause_chain": result.cause_chain
        }
    else:
        raise HTTPException(status_code=400, detail=result.message)


@router.post("/{char_id}/control/takeover")
async def takeover_control(char_id: str, db: AsyncSession = Depends(get_db)):
    character = await db.get(Character, char_id)
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")

    if character.status == "dead":
        raise HTTPException(status_code=400, detail="角色已死亡，无法接管")

    character.controller_type = "player"
    character.controller_version += 1
    character.last_player_heartbeat = datetime.now()
    await db.commit()
    await db.refresh(character)

    return {
        "success": True,
        "message": "接管成功",
        "controller_type": "player",
        "controller_version": character.controller_version
    }


@router.post("/{char_id}/control/release")
async def release_control(char_id: str, db: AsyncSession = Depends(get_db)):
    character = await db.get(Character, char_id)
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")

    character.controller_type = "agent"
    character.controller_version += 1
    await db.commit()
    await db.refresh(character)

    return {
        "success": True,
        "message": "控制权已交还AI",
        "controller_type": "agent",
        "controller_version": character.controller_version
    }


@router.post("/{char_id}/heartbeat")
async def heartbeat(char_id: str, db: AsyncSession = Depends(get_db)):
    controller = PlayerController(db)
    await controller.heartbeat(char_id)
    return {"success": True, "message": "心跳更新成功"}


@router.get("/{char_id}/events")
async def get_character_events(char_id: str, db: AsyncSession = Depends(get_db)):
    from sqlalchemy import select
    results = await db.execute(
        select(PetEvent).where(PetEvent.char_id == char_id).order_by(PetEvent.timestamp.desc()).limit(20)
    )
    return [e.to_dict() for e in results.scalars().all()]


@router.get("/{char_id}/destiny")
async def get_character_destiny(char_id: str, db: AsyncSession = Depends(get_db)):
    character = await db.get(Character, char_id)
    if not character:
        raise HTTPException(status_code=404, detail="角色不存在")

    destiny_system = DestinySystem(db)
    current_region_fate = await destiny_system.get_region_fate(character.current_region or "")
    all_fates = await destiny_system.get_all_fates()

    return {
        "current_region": character.current_region,
        "current_region_fate": current_region_fate,
        "all_fates": all_fates,
        "visible_to_player": destiny_system.is_fate_visible_to_player(),
        "visible_to_planner": destiny_system.is_fate_visible_to_planner()
    }


@router.post("/{char_id}/rewind")
async def rewind_character(char_id: str, checkpoint_id: str = None, db: AsyncSession = Depends(get_db)):
    rewind_system = RewindSystem(db)
    result = await rewind_system.rewind(char_id, checkpoint_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["message"])


@router.get("/{char_id}/checkpoints")
async def get_checkpoints(char_id: str, db: AsyncSession = Depends(get_db)):
    rewind_system = RewindSystem(db)
    return await rewind_system.get_checkpoints(char_id)


@router.get("/{char_id}/worldline")
async def get_worldline_branches(char_id: str, db: AsyncSession = Depends(get_db)):
    rewind_system = RewindSystem(db)
    return await rewind_system.get_worldline_branches(char_id)


@router.get("/{char_id}/death-report")
async def get_death_report(char_id: str, db: AsyncSession = Depends(get_db)):
    death_system = DeathSystem(db)
    result = await death_system.get_death_report(char_id)
    
    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["message"])


@router.post("/{char_id}/ai-turn")
async def run_ai_turn(char_id: str, db: AsyncSession = Depends(get_db)):
    controller = AgentController(db)
    result = await controller.run_turn(char_id)
    
    if result.success:
        return {
            "success": True,
            "message": result.message,
            "event_record": result.event_record.to_dict() if result.event_record else None
        }
    else:
        raise HTTPException(status_code=400, detail=result.message)
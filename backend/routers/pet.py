from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.pet import Pet
from services.world_tick import WorldTickService
from services.schedule_service import ScheduleService
from ai.memory import get_pet_memory
from ai.observation import get_observations, create_observation, get_latest_observation, generate_and_save_observation
from ai.planning import get_plans, get_current_plan, create_plan, update_plan, generate_daily_plan
from ai.reflection import trigger_reflection, get_reflection
from services.notification_service import get_notifications, get_notification, update_notification, mark_all_read, delete_notification
from datetime import datetime, date

router = APIRouter()


@router.get("/{pet_id}/status")
async def get_pet_status(pet_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        return {"error": "Pet not found"}
    return {
        "id": pet.id,
        "name": pet.name,
        "species": pet.species,
        "mood": pet.mood,
        "energy": pet.energy,
        "current_region": pet.current_region,
        "inventory": pet.inventory or [],
        "personality": pet.personality or {},
    }


@router.post("/{pet_id}/interact")
async def interact_with_pet(pet_id: str, action: dict, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Pet).where(Pet.id == pet_id))
    pet = result.scalar_one_or_none()
    if not pet:
        return {"error": "Pet not found"}

    action_type = action.get("type", "unknown")
    if action_type == "feed":
        pet.energy = min(100.0, pet.energy + 10)
    elif action_type == "pet":
        pet.mood = min(100.0, pet.mood + 10)
    elif action_type == "gift":
        pet.mood = min(100.0, pet.mood + 5)
    elif action_type == "rest":
        pet.energy = min(100.0, pet.energy + 20)

    await db.commit()
    return {
        "message": f"成功与 {pet.name} 互动",
        "action": action_type,
        "pet": {
            "mood": pet.mood,
            "energy": pet.energy,
        },
    }


@router.get("/{pet_id}/stream")
async def pet_status_stream(pet_id: str):
    from fastapi.responses import StreamingResponse
    import asyncio
    import json

    async def event_generator():
        while True:
            data = json.dumps({"pet_id": pet_id, "mood": 75, "energy": 60, "timestamp": "now"})
            yield f"data: {data}\n\n"
            await asyncio.sleep(5)

    return StreamingResponse(event_generator(), media_type="text/event-stream")


@router.post("/{pet_id}/sync")
async def sync_offline_events(pet_id: str, data: dict):
    last_online_str = data.get("last_online_time")
    if not last_online_str:
        return {"error": "last_online_time is required"}

    try:
        last_online_time = datetime.fromisoformat(last_online_str.replace("Z", "+00:00"))
    except ValueError:
        return {"error": "Invalid datetime format. Use ISO 8601 format (e.g., 2026-07-11T10:00:00Z)"}

    result = await WorldTickService.sync_offline_events(pet_id, last_online_time)
    return result


@router.get("/{pet_id}/events")
async def get_pet_events(pet_id: str, limit: int = 20):
    events = await WorldTickService.get_pet_events(pet_id, limit)
    return {"pet_id": pet_id, "events": events, "total": len(events)}


@router.get("/{pet_id}/schedule")
async def get_pet_schedule(pet_id: str):
    schedule = await ScheduleService.get_schedule(pet_id)
    if not schedule:
        result = await ScheduleService.generate_and_save_schedule(pet_id)
        return result

    return {
        "pet_id": pet_id,
        "date": schedule.date.isoformat(),
        "activities": schedule.activities,
    }


@router.post("/{pet_id}/schedule/generate")
async def generate_pet_schedule(pet_id: str):
    result = await ScheduleService.generate_and_save_schedule(pet_id)
    return result


@router.get("/{pet_id}/memory/short-term")
async def get_short_term_memories(pet_id: str, hours: int = 24):
    memory = await get_pet_memory(pet_id)
    short_term = await memory.get_short_term_memories(hours)
    return {
        "pet_id": pet_id,
        "memories": short_term,
        "total": len(short_term),
        "type": "short_term",
    }


@router.get("/{pet_id}/memory/long-term")
async def get_long_term_memories(pet_id: str, limit: int = 20):
    memory = await get_pet_memory(pet_id)
    long_term = await memory.get_long_term_memories(limit)
    return {
        "pet_id": pet_id,
        "memories": long_term,
        "total": len(long_term),
        "type": "long_term",
    }


@router.post("/{pet_id}/memory")
async def add_pet_memory(pet_id: str, data: dict):
    content = data.get("content")
    importance = data.get("importance", 0.5)
    category = data.get("category", "general")

    if not content:
        return {"error": "content is required"}

    memory = await get_pet_memory(pet_id)
    await memory.add_memory(content, importance, category)

    return {
        "message": "Memory added successfully",
        "pet_id": pet_id,
        "content": content,
        "importance": importance,
        "category": category,
    }


@router.get("/{pet_id}/memory/summary")
async def get_memory_summary(pet_id: str, limit: int = 5):
    memory = await get_pet_memory(pet_id)
    summary = await memory.get_weighted_summary(limit)
    return {
        "pet_id": pet_id,
        "summary": summary,
    }


@router.get("/{pet_id}/memory/weighted")
async def get_weighted_memories(pet_id: str, limit: int = 10):
    memory = await get_pet_memory(pet_id)
    memories = await memory.get_weighted_memories(limit)
    return {
        "pet_id": pet_id,
        "memories": memories,
        "total": len(memories),
    }


@router.get("/{pet_id}/observations")
async def get_pet_observations(pet_id: str, limit: int = 20):
    observations = await get_observations(pet_id, limit)
    return {
        "pet_id": pet_id,
        "observations": observations,
        "total": len(observations),
    }


@router.post("/{pet_id}/observations")
async def add_pet_observation(pet_id: str, data: dict):
    obs_type = data.get("type", "event")
    content = data.get("content")
    importance = data.get("importance", 0.5)
    context = data.get("context", {})

    if not content:
        return {"error": "content is required"}

    observation = await create_observation(pet_id, obs_type, content, importance, context)
    return observation


@router.get("/{pet_id}/observations/latest")
async def get_pet_latest_observation(pet_id: str):
    observation = await get_latest_observation(pet_id)
    if not observation:
        return {"error": "No observations found"}
    return observation


@router.post("/{pet_id}/observations/generate")
async def generate_pet_observation(pet_id: str):
    observation = await generate_and_save_observation(pet_id)
    if not observation:
        return {"message": "Too soon to generate new observation"}
    return observation


@router.get("/{pet_id}/plans")
async def get_pet_plans(pet_id: str, level: str = None):
    plans = await get_plans(pet_id, level)
    return {
        "pet_id": pet_id,
        "plans": plans,
        "total": len(plans),
    }


@router.get("/{pet_id}/plans/current")
async def get_pet_current_plan(pet_id: str):
    plan = await get_current_plan(pet_id)
    if not plan:
        return {"error": "No active plan found"}
    return plan


@router.post("/{pet_id}/plans")
async def add_pet_plan(pet_id: str, data: dict):
    goal = data.get("goal")
    level = data.get("level", "daily")
    steps = data.get("steps", [])
    priority = data.get("priority", 0.5)

    if not goal:
        return {"error": "goal is required"}

    plan = await create_plan(pet_id, goal, level, steps, priority)
    return plan


@router.put("/{pet_id}/plans/{plan_id}")
async def update_pet_plan(pet_id: str, plan_id: str, data: dict):
    plan = await update_plan(pet_id, plan_id, **data)
    if not plan:
        return {"error": "Plan not found"}
    return plan


@router.post("/{pet_id}/plans/generate")
async def generate_pet_daily_plan(pet_id: str):
    memory = await get_pet_memory(pet_id)
    recent_memories = await memory.get_short_term_memories(24)
    
    result = await trigger_reflection(pet_id)
    reflections = [result]

    async for session in get_db():
        pet_result = await session.execute(select(Pet).where(Pet.id == pet_id))
        pet = pet_result.scalar_one_or_none()
        if not pet:
            return {"error": "Pet not found"}
        
        plan = await generate_daily_plan(pet_id, recent_memories, reflections, pet.energy, pet.mood)
        return plan


@router.get("/{pet_id}/reflection")
async def get_pet_reflection(pet_id: str):
    reflection = await get_reflection(pet_id)
    return {
        "pet_id": pet_id,
        **reflection,
    }


@router.post("/{pet_id}/reflection/trigger")
async def trigger_pet_reflection(pet_id: str):
    reflection = await trigger_reflection(pet_id)
    return {
        "pet_id": pet_id,
        **reflection,
    }


@router.get("/{pet_id}/notifications")
async def get_pet_notifications(pet_id: str, status: str = None):
    notifications = await get_notifications(pet_id, status)
    return {
        "pet_id": pet_id,
        "notifications": notifications,
        "total": len(notifications),
    }


@router.get("/{pet_id}/notifications/{notification_id}")
async def get_pet_notification_detail(pet_id: str, notification_id: str):
    notification = await get_notification(pet_id, notification_id)
    if not notification:
        return {"error": "Notification not found"}
    return notification


@router.put("/{pet_id}/notifications/{notification_id}")
async def update_pet_notification(pet_id: str, notification_id: str, data: dict):
    status = data.get("status")
    if not status:
        return {"error": "status is required"}
    notification = await update_notification(pet_id, notification_id, status)
    return notification


@router.post("/{pet_id}/notifications/read-all")
async def mark_all_notifications_read(pet_id: str):
    result = await mark_all_read(pet_id)
    return result


@router.delete("/{pet_id}/notifications/{notification_id}")
async def delete_pet_notification(pet_id: str, notification_id: str):
    result = await delete_notification(pet_id, notification_id)
    return result
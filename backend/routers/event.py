from datetime import datetime
from fastapi import APIRouter, Query
from services.event_service import (
    create_event, get_event, get_events, update_event, delete_event,
    join_event, leave_event, get_participants, generate_event_story
)

router = APIRouter(prefix="/events", tags=["events"])


@router.get("")
async def list_events(status: str = Query(None, description="活动状态筛选")):
    events = await get_events(status)
    return {"events": events, "total": len(events)}


@router.get("/{event_id}")
async def get_event_detail(event_id: str):
    event = await get_event(event_id)
    if not event:
        return {"error": "Event not found"}
    return event


@router.post("")
async def create_new_event(data: dict):
    name = data.get("name")
    type = data.get("type", "party")
    description = data.get("description", "")
    location = data.get("location", "")
    start_time = datetime.fromisoformat(data.get("start_time"))
    end_time = datetime.fromisoformat(data.get("end_time"))
    rewards = data.get("rewards", [])
    tasks = data.get("tasks", [])

    if not name:
        return {"error": "name is required"}

    event = await create_event(name, type, description, location, start_time, end_time, rewards, tasks)
    return event


@router.put("/{event_id}")
async def update_existing_event(event_id: str, data: dict):
    event = await update_event(event_id, **data)
    if not event:
        return {"error": "Event not found"}
    return event


@router.delete("/{event_id}")
async def delete_existing_event(event_id: str):
    result = await delete_event(event_id)
    return result


@router.post("/{event_id}/join")
async def join_existing_event(event_id: str, data: dict):
    pet_id = data.get("pet_id")
    if not pet_id:
        return {"error": "pet_id is required"}
    result = await join_event(pet_id, event_id)
    return result


@router.post("/{event_id}/leave")
async def leave_existing_event(event_id: str, data: dict):
    pet_id = data.get("pet_id")
    if not pet_id:
        return {"error": "pet_id is required"}
    result = await leave_event(pet_id, event_id)
    return result


@router.get("/{event_id}/participants")
async def list_participants(event_id: str):
    participants = await get_participants(event_id)
    return {"participants": participants, "total": len(participants)}


@router.get("/{event_id}/story")
async def get_event_story(event_id: str):
    event = await get_event(event_id)
    if not event:
        return {"error": "Event not found"}

    if event["status"] != "ended":
        return {"message": "Event hasn't ended yet"}

    return {"event_id": event_id, "story": f"{event['name']}活动已经结束，所有参与者都获得了美好的回忆。"}


@router.post("/{event_id}/story/generate")
async def generate_story(event_id: str):
    event = await get_event(event_id)
    if not event:
        return {"error": "Event not found"}

    from models.event import Event as EventModel
    from database import get_db

    async for session in get_db():
        result = await session.execute(EventModel.__table__.select().where(EventModel.id == event_id))
        event_obj = result.first()
        if event_obj:
            story = await generate_event_story(event_obj)
            return story

    return {"error": "Failed to generate story"}
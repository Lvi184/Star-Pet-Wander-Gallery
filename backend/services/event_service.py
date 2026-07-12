from datetime import datetime, timezone
from sqlalchemy import select, update, delete
from models.event import Event, Participation
from db.database import get_db


async def create_event(name: str, type: str, description: str, location: str,
                       start_time: datetime, end_time: datetime,
                       rewards: list = None, tasks: list = None):
    event = Event(
        id=Event.generate_id(),
        name=name,
        type=type,
        description=description,
        location=location,
        start_time=start_time,
        end_time=end_time,
        rewards=rewards or [],
        tasks=tasks or [],
    )
    async for session in get_db():
        session.add(event)
        await session.commit()
        await session.refresh(event)
        return event.to_dict()


async def get_event(event_id: str):
    async for session in get_db():
        result = await session.execute(select(Event).where(Event.id == event_id))
        event = result.scalar_one_or_none()
        return event.to_dict() if event else None


async def get_events(status: str = None):
    async for session in get_db():
        query = select(Event)
        if status:
            query = query.where(Event.status == status)
        result = await session.execute(query.order_by(Event.start_time))
        events = result.scalars().all()
        return [event.to_dict() for event in events]


async def update_event(event_id: str, **kwargs):
    async for session in get_db():
        query = update(Event).where(Event.id == event_id).values(**kwargs)
        await session.execute(query)
        await session.commit()
        return await get_event(event_id)


async def delete_event(event_id: str):
    async for session in get_db():
        await session.execute(delete(Participation).where(Participation.event_id == event_id))
        await session.execute(delete(Event).where(Event.id == event_id))
        await session.commit()
        return {"message": "Event deleted"}


async def join_event(pet_id: str, event_id: str):
    event = await get_event(event_id)
    if not event:
        return {"error": "Event not found"}

    if pet_id in event["participants"]:
        return {"message": "Already joined"}

    participation = Participation(
        id=Participation.generate_id(),
        pet_id=pet_id,
        event_id=event_id,
    )

    async for session in get_db():
        session.add(participation)
        event_obj = await session.get(Event, event_id)
        event_obj.participants.append(pet_id)
        await session.commit()
        return {"message": "Joined event", "participation": participation.to_dict()}


async def leave_event(pet_id: str, event_id: str):
    async for session in get_db():
        result = await session.execute(
            select(Participation).where(
                Participation.pet_id == pet_id,
                Participation.event_id == event_id
            )
        )
        participation = result.scalar_one_or_none()
        if participation:
            participation.status = "left"
            participation.left_at = datetime.now(timezone.utc)
            await session.commit()

        event_obj = await session.get(Event, event_id)
        if event_obj and pet_id in event_obj.participants:
            event_obj.participants.remove(pet_id)
            await session.commit()

        return {"message": "Left event"}


async def get_participants(event_id: str):
    async for session in get_db():
        result = await session.execute(
            select(Participation).where(Participation.event_id == event_id)
        )
        participations = result.scalars().all()
        return [p.to_dict() for p in participations]


async def update_event_status():
    now = datetime.now(timezone.utc)
    async for session in get_db():
        result = await session.execute(select(Event))
        events = result.scalars().all()
        for event in events:
            if event.status == "upcoming" and event.start_time <= now:
                event.status = "active"
            elif event.status == "active" and event.end_time <= now:
                event.status = "ended"
                await generate_event_story(event)
        await session.commit()


async def generate_event_story(event: Event):
    from services.notification_service import send_notification_to_all
    from ai.memory import MemoryAgent

    story_summary = f"{event.name}活动结束了！"
    tasks_completed = []
    rewards_given = []

    for participant_id in event.participants:
        memory = MemoryAgent(participant_id)
        story = f"今天参加了{event.name}，在{event.location}度过了愉快的时光。"

        if event.tasks:
            completed_tasks = event.tasks[:2]
            tasks_completed.extend(completed_tasks)
            story += f"完成了任务：{', '.join(completed_tasks)}。"

        if event.rewards:
            rewards_given.extend(event.rewards)
            story += f"获得了奖励：{', '.join(event.rewards)}。"

        await memory.add_memory(story, "story", importance=0.8, tags=["event", event.name])

        await send_notification_to_all(
            type="story_update",
            title=f"{event.name}故事更新",
            content=f"你的宠物在{event.name}中获得了新的故事记忆！",
            data={"event_id": event.id, "story_summary": story_summary}
        )

    return {
        "event_id": event.id,
        "story_summary": story_summary,
        "tasks_completed": tasks_completed,
        "rewards_given": rewards_given,
        "participants_count": len(event.participants),
    }
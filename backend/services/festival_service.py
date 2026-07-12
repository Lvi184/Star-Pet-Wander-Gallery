from datetime import datetime, date, timedelta
from sqlalchemy import select
from models.festival import Festival, FESTIVAL_CONFIG
from models.event import Event
from db.database import get_db
from services.event_service import create_event
from services.notification_service import send_notification_to_all


async def init_festivals():
    async for session in get_db():
        result = await session.execute(select(Festival))
        existing_festivals = result.scalars().all()
        existing_names = {f.name for f in existing_festivals}

        for name, config in FESTIVAL_CONFIG.items():
            if name not in existing_names:
                next_date = _calculate_next_date(config)
                festival = Festival(
                    id=Festival.generate_id(),
                    name=name,
                    type=name,
                    description=config["description"],
                    cycle=config["cycle"],
                    next_date=next_date,
                )
                session.add(festival)

        await session.commit()


def _calculate_next_date(config: dict) -> date:
    today = date.today()
    cycle = config["cycle"]

    if cycle == "monthly":
        day = config.get("day_of_month", 1)
        try:
            next_date = today.replace(day=day)
            if next_date <= today:
                next_date = (next_date + timedelta(days=32)).replace(day=day)
            return next_date
        except ValueError:
            return today + timedelta(days=15)

    elif cycle == "yearly":
        month = config.get("month", 1)
        day = config.get("day", 1)
        try:
            next_date = today.replace(month=month, day=day)
            if next_date <= today:
                next_date = next_date.replace(year=today.year + 1)
            return next_date
        except ValueError:
            return today.replace(year=today.year + 1, month=1, day=1)

    elif cycle == "seasonal":
        season = config.get("season", "spring")
        season_months = {
            "spring": [3, 4, 5],
            "summer": [6, 7, 8],
            "autumn": [9, 10, 11],
            "winter": [12, 1, 2],
        }
        months = season_months.get(season, [3, 4, 5])
        for month in months:
            if month >= today.month:
                return today.replace(month=month, day=15)
        return today.replace(year=today.year + 1, month=months[0], day=15)

    else:
        return today + timedelta(days=7)


def _calculate_next_cycle_date(festival: Festival) -> date:
    today = date.today()
    config = FESTIVAL_CONFIG.get(festival.name, {})
    return _calculate_next_date(config)


async def check_festivals():
    today = date.today()
    async for session in get_db():
        result = await session.execute(select(Festival))
        festivals = result.scalars().all()

        for festival in festivals:
            if festival.next_date == today and not festival.event_id:
                await _trigger_festival(session, festival)


async def _trigger_festival(session, festival: Festival):
    config = FESTIVAL_CONFIG.get(festival.name, {})
    start_time = datetime.combine(festival.next_date, datetime.min.time())
    end_time = start_time + timedelta(hours=4)

    event = Event(
        id=Event.generate_id(),
        name=festival.name,
        type="festival",
        description=config.get("description", ""),
        location=config.get("location", "庆典广场"),
        start_time=start_time,
        end_time=end_time,
        rewards=config.get("rewards", []),
        tasks=[],
    )

    session.add(event)
    await session.flush()

    festival.event_id = event.id
    festival.next_date = _calculate_next_cycle_date(festival)
    await session.commit()

    await send_notification_to_all(
        type="festival_notification",
        title=f"{festival.name}开始了！",
        content=f"{festival.name}已经开始，快来参加吧！活动地点：{config.get('location', '')}",
        data={
            "festival_id": festival.id,
            "event_id": event.id,
            "location": config.get("location", ""),
            "rewards": config.get("rewards", []),
        }
    )

    return event.to_dict()


async def get_festivals():
    async for session in get_db():
        result = await session.execute(select(Festival).order_by(Festival.next_date))
        festivals = result.scalars().all()
        return [f.to_dict() for f in festivals]


async def get_festival(festival_id: str):
    async for session in get_db():
        result = await session.execute(select(Festival).where(Festival.id == festival_id))
        festival = result.scalar_one_or_none()
        return festival.to_dict() if festival else None


async def get_upcoming_festivals(days: int = 30):
    today = date.today()
    future_date = today + timedelta(days=days)

    async for session in get_db():
        result = await session.execute(
            select(Festival)
            .where(Festival.next_date >= today)
            .where(Festival.next_date <= future_date)
            .order_by(Festival.next_date)
        )
        festivals = result.scalars().all()
        return [f.to_dict() for f in festivals]


async def trigger_festival(festival_id: str):
    async for session in get_db():
        result = await session.execute(select(Festival).where(Festival.id == festival_id))
        festival = result.scalar_one_or_none()
        if not festival:
            return {"error": "Festival not found"}

        if festival.event_id:
            return {"message": "Festival already triggered"}

        return await _trigger_festival(session, festival)
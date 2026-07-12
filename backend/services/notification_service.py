from datetime import datetime, timezone
from sqlalchemy import select, update
from models.notification import Notification
from db.database import get_db
from models.pet import Pet


async def send_notification(pet_id: str, type: str, title: str, content: str, data: dict = None):
    notification = Notification(
        id=Notification.generate_id(),
        pet_id=pet_id,
        type=type,
        title=title,
        content=content,
        data=data or {},
    )
    async for session in get_db():
        session.add(notification)
        await session.commit()
        await session.refresh(notification)
        return notification.to_dict()


async def send_notification_to_all(type: str, title: str, content: str, data: dict = None):
    async for session in get_db():
        result = await session.execute(select(Pet.id))
        pet_ids = [row[0] for row in result.all()]

        for pet_id in pet_ids:
            notification = Notification(
                id=Notification.generate_id(),
                pet_id=pet_id,
                type=type,
                title=title,
                content=content,
                data=data or {},
            )
            session.add(notification)

        await session.commit()
        return {"message": f"Notification sent to {len(pet_ids)} pets"}


async def get_notifications(pet_id: str, status: str = None):
    async for session in get_db():
        query = select(Notification).where(Notification.pet_id == pet_id)
        if status:
            query = query.where(Notification.status == status)
        result = await session.execute(query.order_by(Notification.created_at.desc()))
        notifications = result.scalars().all()

        for notification in notifications:
            if notification.status == "unread":
                notification.status = "read"
                notification.read_at = datetime.now(timezone.utc)

        await session.commit()
        return [n.to_dict() for n in notifications]


async def get_notification(pet_id: str, notification_id: str):
    async for session in get_db():
        result = await session.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.pet_id == pet_id
            )
        )
        notification = result.scalar_one_or_none()
        if notification and notification.status == "unread":
            notification.status = "read"
            notification.read_at = datetime.now(timezone.utc)
            await session.commit()
        return notification.to_dict() if notification else None


async def update_notification(pet_id: str, notification_id: str, status: str):
    async for session in get_db():
        result = await session.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.pet_id == pet_id
            )
        )
        notification = result.scalar_one_or_none()
        if not notification:
            return {"error": "Notification not found"}

        notification.status = status
        if status == "read" and not notification.read_at:
            notification.read_at = datetime.now(timezone.utc)
        await session.commit()
        return notification.to_dict()


async def mark_all_read(pet_id: str):
    async for session in get_db():
        await session.execute(
            update(Notification)
            .where(Notification.pet_id == pet_id)
            .values(status="read", read_at=datetime.now(timezone.utc))
        )
        await session.commit()
        return {"message": "All notifications marked as read"}


async def delete_notification(pet_id: str, notification_id: str):
    async for session in get_db():
        result = await session.execute(
            select(Notification).where(
                Notification.id == notification_id,
                Notification.pet_id == pet_id
            )
        )
        notification = result.scalar_one_or_none()
        if not notification:
            return {"error": "Notification not found"}

        await session.delete(notification)
        await session.commit()
        return {"message": "Notification deleted"}
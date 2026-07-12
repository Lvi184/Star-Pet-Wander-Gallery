from sqlalchemy import Column, String, DateTime, JSON
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String, primary_key=True, index=True)
    pet_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    title = Column(String, nullable=False)
    content = Column(String)
    data = Column(JSON, default=dict)
    status = Column(String, default="unread")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    read_at = Column(DateTime(timezone=True))

    @staticmethod
    def generate_id():
        return f"notif_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "type": self.type,
            "title": self.title,
            "content": self.content,
            "data": self.data,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "read_at": self.read_at.isoformat() if self.read_at else None,
        }


NOTIFICATION_TYPES = {
    "event_invitation": "活动邀请",
    "festival_notification": "节日通知",
    "friend_request": "好友请求",
    "story_update": "故事更新",
    "system_message": "系统消息",
}

NOTIFICATION_STATUS = {
    "unread": "未读",
    "read": "已读",
    "accepted": "已接受",
    "rejected": "已拒绝",
}
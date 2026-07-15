from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Integer
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(String, primary_key=True, index=True)
    creator_id = Column(String, nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_message_at = Column(DateTime(timezone=True))
    num_messages = Column(Integer, default=0)
    status = Column(String, default="active")
    participants = Column(JSON, default=list)

    @staticmethod
    def generate_id():
        return f"conv_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "creator_id": self.creator_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_message_at": self.last_message_at.isoformat() if self.last_message_at else None,
            "num_messages": self.num_messages,
            "status": self.status,
            "participants": self.participants,
        }


class ConversationMembership(Base):
    __tablename__ = "conversation_memberships"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    char_id = Column(String, nullable=False, index=True)
    status = Column(String, nullable=False)
    invited_at = Column(DateTime(timezone=True), server_default=func.now())
    joined_at = Column(DateTime(timezone=True))
    left_at = Column(DateTime(timezone=True))

    @staticmethod
    def generate_id():
        return f"cm_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "char_id": self.char_id,
            "status": self.status,
            "invited_at": self.invited_at.isoformat() if self.invited_at else None,
            "joined_at": self.joined_at.isoformat() if self.joined_at else None,
            "left_at": self.left_at.isoformat() if self.left_at else None,
        }


class ConversationMessage(Base):
    __tablename__ = "conversation_messages"

    id = Column(String, primary_key=True, index=True)
    conversation_id = Column(String, ForeignKey("conversations.id"), nullable=False, index=True)
    author_id = Column(String, nullable=False, index=True)
    content = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    message_uuid = Column(String, unique=True)

    @staticmethod
    def generate_id():
        return f"msg_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "conversation_id": self.conversation_id,
            "author_id": self.author_id,
            "content": self.content,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "message_uuid": self.message_uuid,
        }
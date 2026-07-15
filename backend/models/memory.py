from sqlalchemy import Column, String, DateTime, JSON, Float, Integer, ForeignKey
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Memory(Base):
    __tablename__ = "memories"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    description = Column(String, nullable=False)
    importance = Column(Float, default=5.0)
    embedding = Column(JSON, default=list)
    data = Column(JSON, default=dict)
    last_access = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"mem_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "type": self.type,
            "description": self.description,
            "importance": self.importance,
            "embedding": self.embedding,
            "data": self.data,
            "last_access": self.last_access.isoformat() if self.last_access else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class MemoryEmbedding(Base):
    __tablename__ = "memory_embeddings"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, nullable=False, index=True)
    embedding = Column(JSON, nullable=False)
    memory_id = Column(String, ForeignKey("memories.id"), index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"me_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "embedding": self.embedding,
            "memory_id": self.memory_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ParticipationRecord(Base):
    __tablename__ = "participation_records"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, nullable=False, index=True)
    other_char_id = Column(String, nullable=False, index=True)
    conversation_id = Column(String, nullable=False)
    ended_at = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"pr_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "other_char_id": self.other_char_id,
            "conversation_id": self.conversation_id,
            "ended_at": self.ended_at.isoformat() if self.ended_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
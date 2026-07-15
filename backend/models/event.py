from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Boolean
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Event(Base):
    __tablename__ = "events"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String)
    location = Column(String)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    status = Column(String, default="upcoming")
    participants = Column(JSON, default=list)
    rewards = Column(JSON, default=list)
    tasks = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @staticmethod
    def generate_id():
        return f"evt_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "location": self.location,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "status": self.status,
            "participants": self.participants,
            "rewards": self.rewards,
            "tasks": self.tasks,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class PetEvent(Base):
    __tablename__ = "pet_events"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, nullable=False, index=True)
    action_type = Column(String, nullable=False)
    location = Column(String)
    detail = Column(String)
    cause_chain = Column(JSON, default=list)
    result = Column(JSON, default=dict)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"pevt_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "action_type": self.action_type,
            "location": self.location,
            "detail": self.detail,
            "cause_chain": self.cause_chain,
            "result": self.result,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "created_at": self.created_at.isoformat() if self.created_at else datetime.now().isoformat(),
        }


class Participation(Base):
    __tablename__ = "participations"

    id = Column(String, primary_key=True, index=True)
    pet_id = Column(String, nullable=False, index=True)
    event_id = Column(String, nullable=False, index=True)
    status = Column(String, default="joined")
    role = Column(String, default="participant")
    arrived_at = Column(DateTime(timezone=True))
    left_at = Column(DateTime(timezone=True))
    tasks_completed = Column(JSON, default=list)
    rewards_claimed = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"part_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "pet_id": self.pet_id,
            "event_id": self.event_id,
            "status": self.status,
            "role": self.role,
            "arrived_at": self.arrived_at.isoformat() if self.arrived_at else None,
            "left_at": self.left_at.isoformat() if self.left_at else None,
            "tasks_completed": self.tasks_completed,
            "rewards_claimed": self.rewards_claimed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
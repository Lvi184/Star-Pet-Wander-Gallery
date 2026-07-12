from sqlalchemy import Column, String, DateTime, JSON, ForeignKey, Float
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Checkpoint(Base):
    __tablename__ = "checkpoints"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, ForeignKey("characters.id"), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    state_snapshot = Column(JSON, default=dict)
    branch_id = Column(String, ForeignKey("worldline_branches.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"ckpt_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "state_snapshot": self.state_snapshot,
            "branch_id": self.branch_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class WorldlineBranch(Base):
    __tablename__ = "worldline_branches"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, ForeignKey("characters.id"), nullable=False)
    parent_branch_id = Column(String, ForeignKey("worldline_branches.id"), nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    seed = Column(Float)
    summary = Column(String)
    echo_summary = Column(String)
    is_active = Column(String, default="active")
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"branch_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "parent_branch_id": self.parent_branch_id,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "seed": self.seed,
            "summary": self.summary,
            "echo_summary": self.echo_summary,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
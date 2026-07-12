from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Biography(Base):
    __tablename__ = "biographies"

    id = Column(String, primary_key=True, index=True)
    char_id = Column(String, ForeignKey("characters.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(String, nullable=False)
    milestone = Column(String)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"bio_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "char_id": self.char_id,
            "title": self.title,
            "content": self.content,
            "milestone": self.milestone,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
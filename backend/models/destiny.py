from sqlalchemy import Column, String, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from db.database import Base
import uuid


class DestinyRecord(Base):
    __tablename__ = "destiny_records"

    id = Column(String, primary_key=True, index=True)
    region_id = Column(String, ForeignKey("world_regions.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    fate_level = Column(String, nullable=False)
    effect = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    @staticmethod
    def generate_id():
        return f"dest_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "region_id": self.region_id,
            "date": self.date.isoformat() if self.date else None,
            "fate_level": self.fate_level,
            "effect": self.effect,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
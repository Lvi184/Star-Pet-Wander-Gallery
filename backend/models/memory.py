from sqlalchemy import Column, String, Float, DateTime, JSON, Integer, Boolean, ForeignKey
from sqlalchemy.sql import func
from db.database import Base


class Memory(Base):
    __tablename__ = "memories"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String, index=True, nullable=False)
    content = Column(String, nullable=False)
    memory_type = Column(String, default="observation")
    importance = Column(Float, default=0.5)
    category = Column(String, default="general")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    tags = Column(JSON, default=list)
    is_short_term = Column(Boolean, default=True)
    decay_rate = Column(Float, default=0.01)
    source_observation_id = Column(Integer, ForeignKey("observations.id"))
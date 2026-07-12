from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from db.database import Base


class Pet(Base):
    __tablename__ = "pets"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    personality = Column(JSON, default=dict)
    mood = Column(Float, default=50.0)
    energy = Column(Float, default=80.0)
    current_region = Column(String, ForeignKey("world_regions.id"), nullable=True)
    inventory = Column(JSON, default=list)
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

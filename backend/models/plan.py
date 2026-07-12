from sqlalchemy import Column, String, Float, DateTime, JSON, Integer, func
from db.database import Base


class Plan(Base):
    __tablename__ = "plans"

    id = Column(String, primary_key=True, index=True)
    pet_id = Column(String, nullable=False, index=True)
    level = Column(String, default="daily")
    goal = Column(String, nullable=False)
    steps = Column(JSON, default=list)
    current_step = Column(Integer, default=0)
    status = Column(String, default="active")
    priority = Column(Float, default=0.5)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
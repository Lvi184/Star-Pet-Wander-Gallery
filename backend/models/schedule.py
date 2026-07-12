from sqlalchemy import Column, String, Integer, Date, DateTime, JSON
from sqlalchemy.sql import func
from db.database import Base


class DailySchedule(Base):
    __tablename__ = "daily_schedules"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String, nullable=False, index=True)
    date = Column(Date, nullable=False)
    activities = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
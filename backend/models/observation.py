from sqlalchemy import Column, Integer, String, Float, DateTime, JSON, func
from db.database import Base


class Observation(Base):
    __tablename__ = "observations"

    id = Column(Integer, primary_key=True, index=True)
    pet_id = Column(String, nullable=False, index=True)
    type = Column(String, nullable=False)
    content = Column(String, nullable=False)
    importance = Column(Float, default=0.5)
    context = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from db.database import Base


class Diary(Base):
    __tablename__ = "diaries"

    id = Column(String, primary_key=True, index=True)
    pet_id = Column(String, ForeignKey("pets.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    scene_image_url = Column(String, nullable=True)
    behavior_chain = Column(JSON, default=list)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

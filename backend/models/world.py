from sqlalchemy import Column, String, Integer, JSON
from db.database import Base


class WorldRegion(Base):
    __tablename__ = "world_regions"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    terrain_type = Column(String, nullable=True)
    discoverable_items = Column(JSON, default=list)
    danger_level = Column(Integer, default=1)

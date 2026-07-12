from sqlalchemy import Column, String, Float, DateTime, ForeignKey, JSON, Integer
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Character(Base):
    __tablename__ = "characters"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    species = Column(String, nullable=False)
    personality = Column(JSON, default=dict)
    mood = Column(Float, default=50.0)
    energy = Column(Float, default=80.0)
    spiritual_power = Column(Float, default=0.0)
    cultivation_level = Column(Integer, default=1)
    current_region = Column(String, ForeignKey("world_regions.id"), nullable=True)
    inventory = Column(JSON, default=list)
    health = Column(Float, default=100.0)
    status = Column(String, default="normal")
    controller_type = Column(String, default="agent")
    controller_version = Column(Integer, default=0)
    last_active = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    last_player_heartbeat = Column(DateTime(timezone=True))
    affinity_map = Column(JSON, default=dict)
    goals = Column(JSON, default=list)

    @staticmethod
    def generate_id():
        return f"char_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "name": self.name,
            "species": self.species,
            "personality": self.personality,
            "mood": self.mood,
            "energy": self.energy,
            "spiritual_power": self.spiritual_power,
            "cultivation_level": self.cultivation_level,
            "current_region": self.current_region,
            "inventory": self.inventory,
            "health": self.health,
            "status": self.status,
            "controller_type": self.controller_type,
            "controller_version": self.controller_version,
            "last_active": self.last_active.isoformat() if self.last_active else None,
            "last_player_heartbeat": self.last_player_heartbeat.isoformat() if self.last_player_heartbeat else None,
            "affinity_map": self.affinity_map,
            "goals": self.goals,
        }
from sqlalchemy import Column, String, Date, DateTime, JSON, ForeignKey
from sqlalchemy.sql import func
from db.database import Base
import uuid


class Festival(Base):
    __tablename__ = "festivals"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    description = Column(String)
    cycle = Column(String, default="monthly")
    next_date = Column(Date, nullable=False)
    event_id = Column(String, ForeignKey("events.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    @staticmethod
    def generate_id():
        return f"fest_{uuid.uuid4().hex[:8]}"

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
            "cycle": self.cycle,
            "next_date": self.next_date.isoformat() if self.next_date else None,
            "event_id": self.event_id,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


FESTIVAL_CONFIG = {
    "星光节": {
        "cycle": "monthly",
        "day_of_month": 15,
        "location": "星空广场",
        "rewards": ["星光碎片"],
        "description": "庆祝星星最亮的夜晚",
    },
    "月圆节": {
        "cycle": "monthly",
        "day_of_month": 1,
        "location": "月光花园",
        "rewards": ["月光水晶"],
        "description": "满月时的聚会",
    },
    "彩虹节": {
        "cycle": "seasonal",
        "season": "spring",
        "location": "彩虹桥",
        "rewards": ["彩虹宝石"],
        "description": "春天第一场雨后的庆典",
    },
    "收获节": {
        "cycle": "seasonal",
        "season": "autumn",
        "location": "丰收农场",
        "rewards": ["丰收果实"],
        "description": "秋天收获季节的庆祝",
    },
    "新年庆典": {
        "cycle": "yearly",
        "month": 1,
        "day": 1,
        "location": "庆典广场",
        "rewards": ["新年礼物"],
        "description": "新年第一天的盛大庆典",
    },
}
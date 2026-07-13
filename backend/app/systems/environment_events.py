from typing import Dict, List, Optional
import random
import time
from dataclasses import dataclass
from enum import Enum

class EventType(str, Enum):
    QI_TIDE = "qi_tide"
    SHADOW_STORM = "shadow_storm"
    METEOR_SHOWER = "meteor_shower"
    STAR_FALL = "star_fall"
    BLIZZARD = "blizzard"
    TSUNAMI = "tsunami"
    FORMATION_FLUCTUATION = "formation_fluctuation"
    STAR_COLLAPSE = "star_collapse"

@dataclass
class EnvironmentEvent:
    event_type: EventType
    id: str
    intensity: float
    duration: int
    start_time: float
    x: Optional[float] = None
    y: Optional[float] = None
    active: bool = True

    def is_expired(self) -> bool:
        return (time.time() - self.start_time) >= self.duration

    def to_dict(self) -> Dict:
        return {
            "event_type": self.event_type.value,
            "id": self.id,
            "intensity": self.intensity,
            "duration": self.duration,
            "remaining": max(0, self.duration - (time.time() - self.start_time)),
            "x": self.x,
            "y": self.y,
            "active": self.active,
        }

class EnvironmentEventPool:
    def __init__(self):
        self.events: Dict[str, EnvironmentEvent] = {}
        self.event_probabilities: Dict[EventType, float] = {
            EventType.QI_TIDE: 0.3,
            EventType.SHADOW_STORM: 0.15,
            EventType.METEOR_SHOWER: 0.1,
            EventType.STAR_FALL: 0.2,
            EventType.BLIZZARD: 0.1,
            EventType.TSUNAMI: 0.05,
            EventType.FORMATION_FLUCTUATION: 0.08,
            EventType.STAR_COLLAPSE: 0.02,
        }

    def generate_event(self, event_type: Optional[EventType] = None) -> Optional[EnvironmentEvent]:
        if event_type is None:
            rand = random.random()
            cumulative = 0.0
            for et, prob in self.event_probabilities.items():
                cumulative += prob
                if rand <= cumulative:
                    event_type = et
                    break

        if event_type is None:
            return None

        event_id = f"{event_type.value}_{int(time.time())}_{random.randint(1000, 9999)}"
        duration = random.randint(5000, 30000)
        intensity = random.uniform(0.3, 1.0)

        event = EnvironmentEvent(
            event_type=event_type,
            id=event_id,
            intensity=intensity,
            duration=duration,
            start_time=time.time(),
            x=random.uniform(0, 1024),
            y=random.uniform(0, 1024),
        )

        self.events[event_id] = event
        return event

    def get_active_events(self) -> List[EnvironmentEvent]:
        active = []
        expired_ids = []
        
        for event_id, event in self.events.items():
            if event.is_expired():
                expired_ids.append(event_id)
            elif event.active:
                active.append(event)

        for event_id in expired_ids:
            del self.events[event_id]

        return active

    def get_event(self, event_id: str) -> Optional[EnvironmentEvent]:
        return self.events.get(event_id)

    def deactivate_event(self, event_id: str):
        event = self.events.get(event_id)
        if event:
            event.active = False

    def remove_event(self, event_id: str):
        self.events.pop(event_id, None)

    def get_active_events_dict(self) -> List[Dict]:
        return [event.to_dict() for event in self.get_active_events()]

    def update_events(self):
        self.get_active_events()

    def clear_all(self):
        self.events.clear()

    def set_region_events(self, region_type: str):
        region_events = {
            "qingqiu": [EventType.QI_TIDE, EventType.STAR_FALL],
            "kunlun": [EventType.METEOR_SHOWER, EventType.BLIZZARD],
            "donghai": [EventType.TSUNAMI, EventType.QI_TIDE],
            "youdu": [EventType.SHADOW_STORM, EventType.STAR_FALL],
            "lingxu": [EventType.FORMATION_FLUCTUATION, EventType.QI_TIDE],
            "xinghai": [EventType.STAR_COLLAPSE, EventType.METEOR_SHOWER],
        }

        events_for_region = region_events.get(region_type, list(self.event_probabilities.keys()))
        
        self.event_probabilities = {
            et: 1.0 / len(events_for_region)
            for et in events_for_region
        }

environment_event_pool = EnvironmentEventPool()
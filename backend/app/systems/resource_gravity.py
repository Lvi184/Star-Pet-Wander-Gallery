from typing import Dict, Tuple, List, Optional
import math
from dataclasses import dataclass

@dataclass
class ResourceSource:
    id: str
    x: float
    y: float
    type: str
    strength: float
    range: float

@dataclass
class CreatureNeed:
    creature_id: str
    needs: Dict[str, float]
    x: float
    y: float

class ResourceGravityField:
    def __init__(self):
        self.resources: List[ResourceSource] = []
        self.creatures: Dict[str, CreatureNeed] = {}

    def add_resource(self, resource: ResourceSource):
        self.resources.append(resource)

    def remove_resource(self, resource_id: str):
        self.resources = [r for r in self.resources if r.id != resource_id]

    def update_creature(self, creature_id: str, needs: Dict[str, float], x: float, y: float):
        self.creatures[creature_id] = CreatureNeed(creature_id, needs, x, y)

    def remove_creature(self, creature_id: str):
        self.creatures.pop(creature_id, None)

    def calculate_gravity(self, creature_id: str) -> Tuple[float, float]:
        creature = self.creatures.get(creature_id)
        if not creature:
            return (0.0, 0.0)

        total_fx = 0.0
        total_fy = 0.0

        for resource in self.resources:
            need = creature.needs.get(resource.type, 0.0)
            if need <= 0:
                continue

            dx = resource.x - creature.x
            dy = resource.y - creature.y
            distance = math.sqrt(dx * dx + dy * dy)

            if distance > resource.range or distance < 0.1:
                continue

            gravity_strength = self._calculate_strength(
                resource.strength,
                need,
                distance,
                resource.range
            )

            fx = (dx / distance) * gravity_strength
            fy = (dy / distance) * gravity_strength

            total_fx += fx
            total_fy += fy

        return (total_fx, total_fy)

    def _calculate_strength(self, resource_strength: float, need: float, 
                           distance: float, range: float) -> float:
        distance_factor = 1.0 - (distance / range)
        return resource_strength * need * distance_factor * distance_factor

    def get_attractive_resources(self, creature_id: str) -> List[Dict]:
        creature = self.creatures.get(creature_id)
        if not creature:
            return []

        results = []
        for resource in self.resources:
            need = creature.needs.get(resource.type, 0.0)
            if need <= 0:
                continue

            dx = resource.x - creature.x
            dy = resource.y - creature.y
            distance = math.sqrt(dx * dx + dy * dy)

            if distance <= resource.range:
                gravity_strength = self._calculate_strength(
                    resource.strength,
                    need,
                    distance,
                    resource.range
                )

                results.append({
                    "resource_id": resource.id,
                    "type": resource.type,
                    "x": resource.x,
                    "y": resource.y,
                    "distance": distance,
                    "gravity_strength": gravity_strength,
                    "need": need,
                })

        results.sort(key=lambda r: r["gravity_strength"], reverse=True)
        return results[:5]

    def update_resources(self, resource_updates: List[Dict]):
        for update in resource_updates:
            resource_id = update.get("id")
            resource = next((r for r in self.resources if r.id == resource_id), None)
            if resource:
                if "x" in update:
                    resource.x = update["x"]
                if "y" in update:
                    resource.y = update["y"]
                if "strength" in update:
                    resource.strength = update["strength"]

    def get_all_resources(self) -> List[Dict]:
        return [
            {
                "id": r.id,
                "x": r.x,
                "y": r.y,
                "type": r.type,
                "strength": r.strength,
                "range": r.range,
            }
            for r in self.resources
        ]

    def clear(self):
        self.resources.clear()
        self.creatures.clear()

resource_gravity_field = ResourceGravityField()
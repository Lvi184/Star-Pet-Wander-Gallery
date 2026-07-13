from typing import Dict, List, Tuple, Optional
import json
from enum import Enum

class RelationType(str, Enum):
    FAMILY = "family"
    FRIEND = "friend"
    RIVAL = "rival"
    MATE = "mate"
    ALLY = "ally"
    STRANGER = "stranger"

class SocialRelation:
    def __init__(self, target_id: str, relation_type: RelationType, strength: float):
        self.target_id = target_id
        self.relation_type = relation_type
        self.strength = strength

    def to_dict(self):
        return {
            "target_id": self.target_id,
            "relation_type": self.relation_type.value,
            "strength": self.strength,
        }

class SocialGraph:
    def __init__(self):
        self.graph: Dict[str, List[SocialRelation]] = {}

    def add_creature(self, creature_id: str):
        if creature_id not in self.graph:
            self.graph[creature_id] = []

    def remove_creature(self, creature_id: str):
        self.graph.pop(creature_id, None)
        for relations in self.graph.values():
            relations[:] = [r for r in relations if r.target_id != creature_id]

    def add_relation(self, source_id: str, target_id: str, relation_type: RelationType, strength: float = 1.0):
        if source_id not in self.graph:
            self.graph[source_id] = []
        if target_id not in self.graph:
            self.graph[target_id] = []

        existing = next((r for r in self.graph[source_id] if r.target_id == target_id), None)
        if existing:
            existing.relation_type = relation_type
            existing.strength = strength
        else:
            self.graph[source_id].append(SocialRelation(target_id, relation_type, strength))

        existing_reverse = next((r for r in self.graph[target_id] if r.target_id == source_id), None)
        if existing_reverse:
            existing_reverse.relation_type = relation_type
            existing_reverse.strength = strength
        else:
            self.graph[target_id].append(SocialRelation(source_id, relation_type, strength))

    def remove_relation(self, source_id: str, target_id: str):
        if source_id in self.graph:
            self.graph[source_id] = [r for r in self.graph[source_id] if r.target_id != target_id]
        if target_id in self.graph:
            self.graph[target_id] = [r for r in self.graph[target_id] if r.target_id != source_id]

    def get_relations(self, creature_id: str) -> List[SocialRelation]:
        return self.graph.get(creature_id, [])

    def get_relation(self, source_id: str, target_id: str) -> Optional[SocialRelation]:
        relations = self.graph.get(source_id, [])
        return next((r for r in relations if r.target_id == target_id), None)

    def update_relation_strength(self, source_id: str, target_id: str, delta: float):
        relation = self.get_relation(source_id, target_id)
        if relation:
            relation.strength = max(0, min(1, relation.strength + delta))

    def get_social_group(self, creature_id: str, max_depth: int = 2) -> List[str]:
        group = {creature_id}
        visited = {creature_id}
        queue = [(creature_id, 0)]

        while queue:
            current, depth = queue.pop(0)
            if depth >= max_depth:
                continue

            for relation in self.get_relations(current):
                if relation.target_id not in visited:
                    visited.add(relation.target_id)
                    group.add(relation.target_id)
                    queue.append((relation.target_id, depth + 1))

        return list(group)

    def get_influence_score(self, source_id: str, target_id: str) -> float:
        relation = self.get_relation(source_id, target_id)
        if not relation:
            return 0.0

        base_scores = {
            RelationType.FAMILY: 0.8,
            RelationType.MATE: 0.9,
            RelationType.FRIEND: 0.5,
            RelationType.ALLY: 0.4,
            RelationType.RIVAL: -0.3,
            RelationType.STRANGER: 0.1,
        }

        return base_scores.get(relation.relation_type, 0.1) * relation.strength

    def get_social_state(self, creature_id: str) -> Dict[str, float]:
        relations = self.get_relations(creature_id)
        state = {}

        for relation in relations:
            state[relation.target_id] = self.get_influence_score(creature_id, relation.target_id)

        return state

    def to_json(self) -> str:
        return json.dumps({
            creature_id: [relation.to_dict() for relation in relations]
            for creature_id, relations in self.graph.items()
        }, ensure_ascii=False, indent=2)

social_graph = SocialGraph()
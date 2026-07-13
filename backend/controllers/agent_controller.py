from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from services.action_resolver import ActionResolver, ActionInput, ActionResult
from app.systems.social_graph import social_graph, RelationType
from app.systems.resource_gravity import resource_gravity_field
from app.systems.environment_events import environment_event_pool
from typing import Dict, Optional, Tuple


class ActionIntent:
    def __init__(self, action_type: str, target: Optional[str] = None,
                 reason: str = "", risk_tolerance: float = 0.5,
                 expected_duration: int = 30):
        self.action_type = action_type
        self.target = target
        self.reason = reason
        self.risk_tolerance = risk_tolerance
        self.expected_duration = expected_duration


class AgentController:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.action_resolver = ActionResolver(db)

    async def decide_action(self, character: Character) -> ActionIntent:
        personality = character.personality or {}
        adventure = personality.get("adventure", 50)
        curiosity = personality.get("curiosity", 50)
        energy = character.energy
        char_id = str(character.id)

        if energy < 20:
            return ActionIntent(action_type="rest", reason="精力不足，需要休息")

        if energy < 40:
            return ActionIntent(action_type="rest", reason="精力较低，休息恢复")

        social_action = self._check_social_influence(char_id)
        if social_action:
            return social_action

        resource_action = self._check_resource_gravity(char_id, character)
        if resource_action:
            return resource_action

        event_action = self._check_environment_events()
        if event_action:
            return event_action

        if adventure > 70:
            return ActionIntent(action_type="explore", reason="冒险家性格，喜欢探索")

        if curiosity > 70:
            return ActionIntent(action_type="explore", reason="好奇心强，想去看看")

        return ActionIntent(action_type="explore", reason="日常探索")

    def _check_social_influence(self, char_id: str) -> Optional[ActionIntent]:
        social_state = social_graph.get_social_state(char_id)
        
        if social_state:
            strongest_relation = max(social_state.items(), key=lambda x: abs(x[1]))
            target_id, influence = strongest_relation

            if influence > 0.6:
                return ActionIntent(
                    action_type="socialize",
                    target=target_id,
                    reason=f"与{target_id}关系密切，想去互动"
                )

            if influence < -0.2:
                return ActionIntent(
                    action_type="avoid",
                    target=target_id,
                    reason=f"与{target_id}关系紧张，需要避开"
                )

        return None

    def _check_resource_gravity(self, char_id: str, character: Character) -> Optional[ActionIntent]:
        needs = self._get_creature_needs(character)
        
        resource_gravity_field.update_creature(char_id, needs, 
                                               character.x or 0, character.y or 0)
        
        attractive = resource_gravity_field.get_attractive_resources(char_id)
        
        if attractive:
            strongest = attractive[0]
            if strongest["gravity_strength"] > 0.4:
                return ActionIntent(
                    action_type="move_to_resource",
                    target=strongest["resource_id"],
                    reason=f"被资源{strongest['type']}吸引，引力强度: {strongest['gravity_strength']:.2f}"
                )

        return None

    def _get_creature_needs(self, character: Character) -> Dict[str, float]:
        needs = {}
        
        if character.energy < 50:
            needs["food"] = (50 - character.energy) / 50
        
        if character.health < 80:
            needs["healing"] = (80 - character.health) / 80
        
        needs["exploration"] = 0.3
        
        return needs

    def _check_environment_events(self) -> Optional[ActionIntent]:
        active_events = environment_event_pool.get_active_events_dict()
        
        if active_events:
            strongest_event = max(active_events, key=lambda e: e["intensity"])
            
            if strongest_event["intensity"] > 0.7:
                event_type = strongest_event["event_type"]
                responses = {
                    "shadow_storm": ActionIntent(
                        action_type="hide",
                        reason="暗影风暴来袭，需要躲避"
                    ),
                    "tsunami": ActionIntent(
                        action_type="escape",
                        reason="海啸即将到来，紧急撤离"
                    ),
                    "blizzard": ActionIntent(
                        action_type="shelter",
                        reason="暴风雪来袭，寻找庇护所"
                    ),
                    "star_collapse": ActionIntent(
                        action_type="escape",
                        reason="星辰崩塌，极度危险"
                    ),
                }
                
                return responses.get(event_type)

        return None

    async def execute_action(self, char_id: str, action_intent: ActionIntent) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        action_input = ActionInput(
            char_id=char_id,
            action_type=action_intent.action_type,
            target=action_intent.target,
            kwargs={"reason": action_intent.reason},
            controller_type="agent"
        )

        result = await self.action_resolver.resolve(action_input)
        
        if result.success:
            self._update_social_relations(char_id, action_intent)
        
        return result

    def _update_social_relations(self, char_id: str, action_intent: ActionIntent):
        if action_intent.action_type == "socialize" and action_intent.target:
            social_graph.update_relation_strength(char_id, action_intent.target, 0.1)
        
        if action_intent.action_type == "help" and action_intent.target:
            social_graph.update_relation_strength(char_id, action_intent.target, 0.15)
        
        if action_intent.action_type == "compete" and action_intent.target:
            social_graph.update_relation_strength(char_id, action_intent.target, -0.05)

    async def run_turn(self, char_id: str) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        if character.controller_type != "agent":
            return ActionResult(success=False, message="当前角色不由AI控制")

        action_intent = await self.decide_action(character)
        return await self.execute_action(char_id, action_intent)
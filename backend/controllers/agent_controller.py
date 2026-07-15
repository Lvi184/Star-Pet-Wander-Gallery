from sqlalchemy.ext.asyncio import AsyncSession
from models.character import Character
from models.conversation import ConversationMembership
from services.action_resolver import ActionResolver, ActionInput, ActionResult
from services.conversation_service import ConversationService
from services.movement_service import MovementService
from app.systems.social_graph import social_graph, RelationType
from app.systems.resource_gravity import resource_gravity_field
from app.systems.environment_events import environment_event_pool
from typing import Dict, Optional, Tuple, List
import random
from datetime import datetime, timedelta


class ActionIntent:
    def __init__(self, action_type: str, target: Optional[str] = None,
                 reason: str = "", risk_tolerance: float = 0.5,
                 expected_duration: int = 30, kwargs: Optional[Dict] = None):
        self.action_type = action_type
        self.target = target
        self.reason = reason
        self.risk_tolerance = risk_tolerance
        self.expected_duration = expected_duration
        self.kwargs = kwargs or {}


class AgentController:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.action_resolver = ActionResolver(db)
        self.conversation_service = ConversationService(db)
        self.movement_service = MovementService(db)

    REGION_RESOURCES = {
        "qingqiu": ["狐火草", "妖灵果", "青丘玉", "月影花"],
        "kunlun": ["昆仑雪莲", "千年冰晶", "仙灵芝", "玉龙鳞"],
        "donghai": ["龙珠碎片", "珊瑚", "鲛人泪", "定海石"],
        "youdu": ["幽冥火", "黄泉水", "鬼灵石", "往生花"],
        "lingxu": ["灵气结晶", "仙草", "灵石", "悟道茶"],
        "xinghai": ["星辰碎片", "宇宙尘埃", "星河之水", "时空水晶"],
    }

    REGION_EVENTS = {
        "qingqiu": [
            ("发现狐火在林间闪烁", "discover", {"mood_change": 8, "energy_change": -3}),
            ("遇到一只九尾狐前辈", "social", {"mood_change": 20, "energy_change": -5}),
            ("采集到珍贵的狐火草", "collect", {"mood_change": 15, "energy_change": -8}),
            ("看到月圆之夜的幻境", "discover", {"mood_change": 18, "energy_change": -4}),
        ],
        "kunlun": [
            ("在雪山之巅冥想", "explore", {"mood_change": 10, "energy_change": -8}),
            ("遇到守护雪山的冰灵", "social", {"mood_change": 12, "energy_change": -5}),
            ("采摘到千年雪莲", "collect", {"mood_change": 25, "energy_change": -10}),
            ("看到雪山崩塌的奇观", "discover", {"mood_change": 5, "energy_change": -3}),
        ],
        "donghai": [
            ("在海底自由遨游", "explore", {"mood_change": 15, "energy_change": -6}),
            ("遇到友善的鲛人", "social", {"mood_change": 20, "energy_change": -4}),
            ("找到失落的龙珠碎片", "collect", {"mood_change": 30, "energy_change": -12}),
            ("看到海底火山喷发", "discover", {"mood_change": 10, "energy_change": -5}),
        ],
        "lingxu": [
            ("感受到浓郁的灵气", "explore", {"mood_change": 12, "energy_change": -3}),
            ("遇到悟道的仙人", "social", {"mood_change": 25, "energy_change": -5}),
            ("采集到仙草", "collect", {"mood_change": 20, "energy_change": -8}),
            ("看到灵气汇聚成的异象", "discover", {"mood_change": 18, "energy_change": -4}),
        ],
        "youdu": [
            ("在幽冥之地徘徊", "explore", {"mood_change": -5, "energy_change": -8}),
            ("遇到等待轮回的灵魂", "social", {"mood_change": 5, "energy_change": -6}),
            ("收集到幽冥火", "collect", {"mood_change": 10, "energy_change": -10}),
            ("看到黄泉河的摆渡人", "discover", {"mood_change": 8, "energy_change": -4}),
        ],
        "xinghai": [
            ("在星海中漂流", "explore", {"mood_change": 15, "energy_change": -6}),
            ("遇到星灵", "social", {"mood_change": 20, "energy_change": -4}),
            ("收集到星辰碎片", "collect", {"mood_change": 25, "energy_change": -10}),
            ("看到星系碰撞的壮观景象", "discover", {"mood_change": 30, "energy_change": -5}),
        ],
    }

    MORNING_HOURS = (6, 12)
    AFTERNOON_HOURS = (12, 18)
    EVENING_HOURS = (18, 22)
    NIGHT_HOURS = (22, 6)

    SCHEDULE_ACTIONS = {
        "morning": [
            ("explore", 0.5),
            ("discover", 0.3),
            ("collect", 0.15),
            ("move", 0.05),
        ],
        "afternoon": [
            ("explore", 0.2),
            ("discover", 0.15),
            ("social", 0.4),
            ("collect", 0.15),
            ("move", 0.1),
        ],
        "evening": [
            ("social", 0.3),
            ("explore", 0.2),
            ("rest", 0.3),
            ("move", 0.2),
        ],
        "night": [
            ("rest", 0.8),
            ("sleep", 0.2),
        ],
    }

    def _get_time_period(self) -> str:
        hour = datetime.now().hour
        if self.MORNING_HOURS[0] <= hour < self.MORNING_HOURS[1]:
            return "morning"
        elif self.AFTERNOON_HOURS[0] <= hour < self.AFTERNOON_HOURS[1]:
            return "afternoon"
        elif self.EVENING_HOURS[0] <= hour < self.EVENING_HOURS[1]:
            return "evening"
        else:
            return "night"

    async def decide_action(self, character: Character) -> ActionIntent:
        personality = character.personality or {}
        adventure = personality.get("adventure", 50)
        curiosity = personality.get("curiosity", 50)
        friendliness = personality.get("friendliness", 50)
        energy = character.energy
        health = character.health
        mood = character.mood
        char_id = str(character.id)
        region = character.current_region or "qingqiu"

        if health < 30:
            return ActionIntent(action_type="rest", reason="身体虚弱，需要休养", kwargs={"healing": True})

        if energy < 20:
            return ActionIntent(action_type="rest", reason="精疲力竭，需要休息")

        if energy < 40:
            if random.random() < 0.7:
                return ActionIntent(action_type="rest", reason="精力较低，休息恢复")
            else:
                return ActionIntent(action_type="explore", reason="虽然有点累，但还是想去看看", kwargs={"region": region})

        if mood < 20:
            if random.random() < 0.6:
                return ActionIntent(action_type="rest", reason="心情低落，需要独处")
            else:
                return self._generate_explore_event(region, character)

        event_action = self._check_environment_events()
        if event_action:
            return event_action

        time_period = self._get_time_period()

        roll = random.random()
        cumulative = 0.0
        for action_type, probability in self.SCHEDULE_ACTIONS[time_period]:
            cumulative += probability
            if roll < cumulative:
                if action_type == "explore":
                    return self._generate_explore_event(region, character)
                elif action_type == "discover":
                    return self._generate_discover_event(region, character)
                elif action_type == "collect":
                    return self._generate_collect_action(region, character)
                elif action_type == "move":
                    return self._generate_move_action(character)
                elif action_type == "social":
                    social_action = await self._try_social_action(char_id, character)
                    if social_action:
                        return social_action
                    else:
                        return self._generate_explore_event(region, character)
                elif action_type == "rest":
                    return ActionIntent(action_type="rest", reason="日常休息")
                elif action_type == "sleep":
                    return ActionIntent(action_type="rest", reason="夜深了，该睡觉了", kwargs={"healing": True})

        return self._generate_explore_event(region, character)

    async def _try_social_action(self, char_id: str, character: Character) -> Optional[ActionIntent]:
        candidate = await self.conversation_service.get_conversation_candidate(
            char_id, character.current_region or "qingqiu"
        )
        if candidate:
            return ActionIntent(
                action_type="socialize",
                target=candidate,
                reason=f"想和{candidate}交朋友"
            )
        return None

    def _generate_explore_event(self, region: str, character: Character) -> ActionIntent:
        events = self.REGION_EVENTS.get(region, self.REGION_EVENTS["qingqiu"])
        explore_events = [e for e in events if e[1] in ["explore", "discover"]]

        if explore_events:
            event_desc, action_type, effects = random.choice(explore_events)
            mood_change = effects.get("mood_change", 5)
            energy_change = effects.get("energy_change", -5)

            return ActionIntent(
                action_type=action_type,
                reason=f"{event_desc}",
                kwargs={
                    "region": region,
                    "event_desc": event_desc,
                    "mood_change": mood_change,
                    "energy_change": energy_change,
                }
            )

        return ActionIntent(
            action_type="explore",
            reason=f"在{region}探索了一番",
            kwargs={"region": region}
        )

    def _generate_discover_event(self, region: str, character: Character) -> ActionIntent:
        events = self.REGION_EVENTS.get(region, self.REGION_EVENTS["qingqiu"])
        discover_events = [e for e in events if e[1] == "discover"]

        if discover_events:
            event_desc, _, effects = random.choice(discover_events)
            mood_change = effects.get("mood_change", 10)

            return ActionIntent(
                action_type="discover",
                reason=f"{event_desc}",
                kwargs={
                    "region": region,
                    "event_desc": event_desc,
                    "mood_change": mood_change,
                }
            )

        return ActionIntent(
            action_type="discover",
            reason=f"在{region}发现了一处神秘景观",
            kwargs={"region": region}
        )

    def _generate_collect_action(self, region: str, character: Character) -> ActionIntent:
        resources = self.REGION_RESOURCES.get(region, self.REGION_RESOURCES["qingqiu"])
        item = random.choice(resources)

        return ActionIntent(
            action_type="collect",
            target=item,
            reason=f"采集到了{item}",
            kwargs={
                "region": region,
                "item": item,
            }
        )

    def _generate_move_action(self, character: Character) -> ActionIntent:
        current_region = character.current_region or "qingqiu"
        all_regions = list(self.REGION_RESOURCES.keys())
        available_regions = [r for r in all_regions if r != current_region]

        if available_regions:
            target_region = random.choice(available_regions)

            return ActionIntent(
                action_type="move",
                target=target_region,
                reason=f"前往{target_region}探索",
                kwargs={
                    "target_region": target_region,
                }
            )

        return ActionIntent(
            action_type="explore",
            reason="继续在当前区域探索",
            kwargs={"region": current_region}
        )

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

        x_pos = getattr(character, 'x', 0) or 0
        y_pos = getattr(character, 'y', 0) or 0
        resource_gravity_field.update_creature(char_id, needs, x_pos, y_pos)

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
            kwargs={**action_intent.kwargs, "reason": action_intent.reason},
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

    async def handle_input(self, char_id: str, action_type: str, **kwargs) -> ActionResult:
        return await self.run_turn(char_id)

    async def run_turn(self, char_id: str) -> ActionResult:
        character = await self.db.get(Character, char_id)
        if not character:
            return ActionResult(success=False, message="角色不存在")

        if character.controller_type != "agent":
            return ActionResult(success=False, message="当前角色不由AI控制")

        conversation_result = await self._process_conversation_state(char_id, character)
        if conversation_result:
            await self.movement_service.wander(char_id)
            return conversation_result

        await self.movement_service.wander(char_id)

        action_intent = await self.decide_action(character)
        return await self.execute_action(char_id, action_intent)

    async def _process_conversation_state(self, char_id: str, character: Character) -> Optional[ActionResult]:
        from sqlalchemy import select

        result = await self.db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.char_id == char_id)
            .filter(ConversationMembership.status.in_(["invited", "walkingOver", "participating"]))
        )
        membership = result.scalar_one_or_none()

        if not membership:
            candidate = await self.conversation_service.get_conversation_candidate(
                char_id, character.current_region or "qingqiu"
            )
            if candidate and self._should_initiate_conversation(character):
                if random.random() < 0.2:
                    await self.conversation_service.start_conversation(char_id, candidate)
                    return ActionResult(
                        success=True,
                        message=f"向{candidate}发起了对话邀请"
                    )
            return None

        if membership.status == "invited":
            if random.random() < 0.2:
                await self.conversation_service.accept_invite(char_id, membership.conversation_id)
                return ActionResult(
                    success=True,
                    message=f"接受了对话邀请"
                )
            else:
                await self.conversation_service.reject_invite(char_id, membership.conversation_id)
                return ActionResult(
                    success=True,
                    message=f"拒绝了对话邀请，想去探索"
                )

        if membership.status == "walkingOver":
            await self.conversation_service.join_conversation(char_id, membership.conversation_id)
            return ActionResult(
                success=True,
                message=f"加入了对话"
            )

        if membership.status == "participating":
            return await self._process_participating_conversation(char_id, membership.conversation_id)

        return None

    def _should_initiate_conversation(self, character: Character) -> bool:
        personality = character.personality or {}
        friendliness = personality.get("friendliness", 50)
        curiosity = personality.get("curiosity", 50)

        if character.energy < 30:
            return False

        base_probability = (friendliness + curiosity) / 200
        bonus = 0.2 if character.mood > 70 else 0
        penalty = 0.2 if character.mood < 30 else 0

        return random.random() < (base_probability + bonus - penalty)

    async def _process_participating_conversation(self, char_id: str, conversation_id: str) -> ActionResult:
        from sqlalchemy import select
        from models.conversation import Conversation, ConversationMessage

        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return ActionResult(success=False, message="对话不存在")

        messages = await self.db.execute(
            select(ConversationMessage)
            .filter(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.timestamp.desc())
            .limit(1)
        )
        last_message = messages.scalar_one_or_none()

        if conversation.num_messages >= self.conversation_service.MAX_CONVERSATION_MESSAGES:
            message_text = await self.conversation_service.generate_message(
                char_id, conversation_id, "leave"
            )
            if message_text:
                await self.conversation_service.send_message(char_id, conversation_id, message_text)
            await self.conversation_service.leave_conversation(char_id, conversation_id)
            return ActionResult(
                success=True,
                message="对话结束，已离开"
            )

        if last_message and last_message.author_id == char_id:
            if random.random() < 0.7:
                message_text = await self.conversation_service.generate_message(
                    char_id, conversation_id, "leave"
                )
                if message_text:
                    await self.conversation_service.send_message(char_id, conversation_id, message_text)
                await self.conversation_service.leave_conversation(char_id, conversation_id)
                return ActionResult(
                    success=True,
                    message="主动结束对话，去探索新区域"
                )

        if last_message and last_message.author_id != char_id:
            time_diff = (datetime.now() - last_message.timestamp).total_seconds()
            if time_diff >= self.conversation_service.MESSAGE_COOLDOWN:
                message_text = await self.conversation_service.generate_message(
                    char_id, conversation_id, "continue"
                )
                if message_text:
                    await self.conversation_service.send_message(char_id, conversation_id, message_text)
                return ActionResult(
                    success=True,
                    message="回复了对话"
                )
            else:
                return ActionResult(
                    success=True,
                    message="等待对方回复"
                )

        return ActionResult(
            success=True,
            message="对话中"
        )
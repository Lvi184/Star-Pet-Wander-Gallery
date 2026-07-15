import json
import httpx
import uuid
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from config import settings
from models.conversation import Conversation, ConversationMembership, ConversationMessage
from models.character import Character
from models.memory import Memory, ParticipationRecord


class ConversationService:
    CONVERSATION_COOLDOWN = 300
    MAX_CONVERSATION_DURATION = 1800
    MAX_CONVERSATION_MESSAGES = 20
    MESSAGE_COOLDOWN = 30
    INVITE_ACCEPT_PROBABILITY = 0.7

    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_conversation(self, initiator_id: str, target_id: str) -> Dict:
        initiator = await self.db.get(Character, initiator_id)
        target = await self.db.get(Character, target_id)

        if not initiator or not target:
            return {"success": False, "error": "角色不存在"}

        if await self._is_in_conversation(initiator_id):
            return {"success": False, "error": "发起者已在对话中"}

        if await self._is_in_conversation(target_id):
            return {"success": False, "error": "目标角色已在对话中"}

        if await self._is_recent_conversation(initiator_id, target_id):
            return {"success": False, "error": "最近刚对话过，请稍后再试"}

        conversation_id = Conversation.generate_id()

        conversation = Conversation(
            id=conversation_id,
            creator_id=initiator_id,
            participants=[initiator_id, target_id],
        )
        self.db.add(conversation)

        membership1 = ConversationMembership(
            id=ConversationMembership.generate_id(),
            conversation_id=conversation_id,
            char_id=initiator_id,
            status="walkingOver",
        )
        self.db.add(membership1)

        membership2 = ConversationMembership(
            id=ConversationMembership.generate_id(),
            conversation_id=conversation_id,
            char_id=target_id,
            status="invited",
        )
        self.db.add(membership2)

        await self.db.commit()

        return {
            "success": True,
            "conversation_id": conversation_id,
            "initiator_id": initiator_id,
            "target_id": target_id,
        }

    async def accept_invite(self, char_id: str, conversation_id: str) -> Dict:
        membership = await self._get_membership(char_id, conversation_id)

        if not membership:
            return {"success": False, "error": "不是对话成员"}

        if membership.status != "invited":
            return {"success": False, "error": "当前状态不允许接受邀请"}

        membership.status = "walkingOver"
        membership.joined_at = datetime.now()
        await self.db.commit()

        return {"success": True}

    async def reject_invite(self, char_id: str, conversation_id: str) -> Dict:
        membership = await self._get_membership(char_id, conversation_id)

        if not membership:
            return {"success": False, "error": "不是对话成员"}

        if membership.status != "invited":
            return {"success": False, "error": "当前状态不允许拒绝邀请"}

        await self._end_conversation(conversation_id)

        return {"success": True}

    async def join_conversation(self, char_id: str, conversation_id: str) -> Dict:
        membership = await self._get_membership(char_id, conversation_id)

        if not membership:
            return {"success": False, "error": "不是对话成员"}

        if membership.status != "walkingOver":
            return {"success": False, "error": "当前状态不允许加入"}

        membership.status = "participating"
        await self.db.commit()

        other_members = await self._get_other_members(char_id, conversation_id)
        if other_members and all(m.status == "participating" for m in other_members):
            await self._send_first_message(conversation_id)

        return {"success": True}

    async def leave_conversation(self, char_id: str, conversation_id: str) -> Dict:
        membership = await self._get_membership(char_id, conversation_id)

        if not membership:
            return {"success": False, "error": "不是对话成员"}

        membership.status = "left"
        membership.left_at = datetime.now()
        await self.db.commit()

        await self._end_conversation(conversation_id)

        return {"success": True}

    async def send_message(self, char_id: str, conversation_id: str, content: str) -> Dict:
        membership = await self._get_membership(char_id, conversation_id)

        if not membership:
            return {"success": False, "error": "不是对话成员"}

        if membership.status != "participating":
            return {"success": False, "error": "当前状态不允许发送消息"}

        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return {"success": False, "error": "对话不存在"}

        last_message = await self._get_last_message(conversation_id)
        if last_message and last_message.author_id == char_id:
            time_diff = (datetime.now() - last_message.timestamp).total_seconds()
            if time_diff < self.MESSAGE_COOLDOWN:
                return {"success": False, "error": "消息发送过于频繁"}

        message = ConversationMessage(
            id=ConversationMessage.generate_id(),
            conversation_id=conversation_id,
            author_id=char_id,
            content=content,
            message_uuid=str(uuid.uuid4()),
        )
        self.db.add(message)

        conversation.num_messages += 1
        conversation.last_message_at = datetime.now()
        await self.db.commit()
        await self.db.refresh(message)

        return {
            "success": True,
            "message_id": message.id,
            "timestamp": message.timestamp.isoformat(),
        }

    async def generate_message(self, char_id: str, conversation_id: str, message_type: str) -> Optional[str]:
        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return None

        char = await self.db.get(Character, char_id)
        if not char:
            return None

        other_char_id = None
        for pid in conversation.participants:
            if pid != char_id:
                other_char_id = pid
                break

        if not other_char_id:
            return None

        other_char = await self.db.get(Character, other_char_id)
        if not other_char:
            return None

        messages = await self._get_messages(conversation_id)
        memories = await self._get_related_memories(char_id, other_char_id)

        if message_type == "start":
            return await self._generate_start_message(char, other_char, memories)
        elif message_type == "continue":
            return await self._generate_continue_message(char, other_char, messages, memories)
        elif message_type == "leave":
            return await self._generate_leave_message(char, other_char, messages)
        else:
            return None

    async def _generate_start_message(self, char: Character, other_char: Character, memories: List[Memory]) -> Optional[str]:
        if not settings.deepseek_api_key:
            return self._rule_based_start_message(char, other_char)

        prompt = self._build_start_prompt(char, other_char, memories)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.deepseek_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.7,
                        "max_tokens": 300,
                    },
                )

            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return content.strip()
        except Exception:
            pass

        return self._rule_based_start_message(char, other_char)

    async def _generate_continue_message(self, char: Character, other_char: Character, 
                                          messages: List[ConversationMessage], memories: List[Memory]) -> Optional[str]:
        if not settings.deepseek_api_key:
            return self._rule_based_continue_message(char, other_char, messages)

        prompt = self._build_continue_prompt(char, other_char, messages, memories)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.deepseek_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.6,
                        "max_tokens": 200,
                    },
                )

            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return content.strip()
        except Exception:
            pass

        return self._rule_based_continue_message(char, other_char, messages)

    async def _generate_leave_message(self, char: Character, other_char: Character, 
                                      messages: List[ConversationMessage]) -> Optional[str]:
        if not settings.deepseek_api_key:
            return self._rule_based_leave_message(char, other_char)

        prompt = self._build_leave_prompt(char, other_char, messages)

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.deepseek_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.5,
                        "max_tokens": 150,
                    },
                )

            if response.status_code == 200:
                result = response.json()
                content = result["choices"][0]["message"]["content"]
                return content.strip()
        except Exception:
            pass

        return self._rule_based_leave_message(char, other_char)

    def _build_start_prompt(self, char: Character, other_char: Character, memories: List[Memory]) -> str:
        personality = char.personality or {}
        other_personality = other_char.personality or {}

        prompt = f"""你是{char.name}，一只{char.species}。
你的性格：好奇心={personality.get('curiosity', 50)}，友善度={personality.get('friendliness', 50)}，冒险精神={personality.get('adventure', 50)}

你刚刚遇到了{other_char.name}，一只{other_char.species}。
{other_char.name}的性格：好奇心={other_personality.get('curiosity', 50)}，友善度={other_personality.get('friendliness', 50)}

"""

        if memories:
            prompt += "你们之前有过一些交集：\n"
            for mem in memories[:3]:
                prompt += f"- {mem.description}\n"
            prompt += "\n请在打招呼时提及之前的经历。\n"

        prompt += f"{char.name}对{other_char.name}说："

        return prompt

    def _build_continue_prompt(self, char: Character, other_char: Character, 
                                messages: List[ConversationMessage], memories: List[Memory]) -> str:
        personality = char.personality or {}

        prompt = f"""你是{char.name}，正在和{other_char.name}对话。
你的性格：好奇心={personality.get('curiosity', 50)}，友善度={personality.get('friendliness', 50)}

对话历史：
"""

        for msg in messages[-5:]:
            author_name = char.name if msg.author_id == char.id else other_char.name
            prompt += f"{author_name}: {msg.content}\n"

        if memories:
            prompt += "\n相关回忆：\n"
            for mem in memories[:2]:
                prompt += f"- {mem.description}\n"

        prompt += f"\n请继续对话，回复要简短自然，不要重复之前说过的内容。\n"
        prompt += f"{char.name}："

        return prompt

    def _build_leave_prompt(self, char: Character, other_char: Character, 
                            messages: List[ConversationMessage]) -> str:
        prompt = f"""你是{char.name}，正在和{other_char.name}对话。
你决定结束对话离开。请礼貌地告别，不要太突兀。

最近对话：
"""

        for msg in messages[-3:]:
            author_name = char.name if msg.author_id == char.id else other_char.name
            prompt += f"{author_name}: {msg.content}\n"

        prompt += f"\n{char.name}（准备离开）："

        return prompt

    def _rule_based_start_message(self, char: Character, other_char: Character) -> str:
        greetings = [
            f"你好呀{other_char.name}！我是{char.name}，很高兴见到你！",
            f"嗨{other_char.name}，我是{char.name}，你在这里做什么呢？",
            f"{other_char.name}！好久不见，最近过得怎么样？",
            f"嘿{other_char.name}，我是{char.name}，想聊聊天吗？",
        ]
        import random
        return random.choice(greetings)

    def _rule_based_continue_message(self, char: Character, other_char: Character, 
                                      messages: List[ConversationMessage]) -> str:
        responses = [
            "真的吗？那很有趣呢！",
            "我也觉得是这样。",
            "你说得对！",
            "哈哈，确实如此。",
            "然后呢？后来怎么样了？",
            "我之前也有类似的经历。",
            "哇，听起来很棒！",
            "嗯，我明白了。",
        ]
        import random
        return random.choice(responses)

    def _rule_based_leave_message(self, char: Character, other_char: Character) -> str:
        farewells = [
            f"和你聊天很开心{other_char.name}，下次再见！",
            f"我得先走了{other_char.name}，改天再聊吧！",
            f"再见{other_char.name}，希望很快能再见面！",
            f"{other_char.name}，谢谢你陪我聊天，我先走啦！",
        ]
        import random
        return random.choice(farewells)

    async def _send_first_message(self, conversation_id: str):
        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return

        creator_id = conversation.creator_id
        message_text = await self.generate_message(creator_id, conversation_id, "start")

        if message_text:
            await self.send_message(creator_id, conversation_id, message_text)

    async def _end_conversation(self, conversation_id: str):
        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return

        conversation.status = "ended"

        members = await self._get_memberships(conversation_id)
        for member in members:
            if member.status != "left":
                member.status = "left"
                member.left_at = datetime.now()

        await self._save_conversation_memory(conversation_id)
        await self.db.commit()

    async def _save_conversation_memory(self, conversation_id: str):
        conversation = await self.db.get(Conversation, conversation_id)
        if not conversation:
            return

        messages = await self._get_messages(conversation_id)
        if not messages:
            return

        for char_id in conversation.participants:
            other_char_ids = [pid for pid in conversation.participants if pid != char_id]
            if not other_char_ids:
                continue

            char = await self.db.get(Character, char_id)
            other_char = await self.db.get(Character, other_char_ids[0])

            if not char or not other_char:
                continue

            conversation_text = "\n".join(
                f"{(char.name if m.author_id == char_id else other_char.name)}: {m.content}"
                for m in messages
            )

            summary = await self._summarize_conversation(char, other_char, messages)

            memory = Memory(
                id=Memory.generate_id(),
                char_id=char_id,
                type="conversation",
                description=summary,
                importance=self._calculate_importance(messages),
                data={
                    "conversation_id": conversation_id,
                    "other_char_id": other_char_ids[0],
                    "message_count": len(messages),
                },
            )
            self.db.add(memory)

            record = ParticipationRecord(
                id=ParticipationRecord.generate_id(),
                char_id=char_id,
                other_char_id=other_char_ids[0],
                conversation_id=conversation_id,
            )
            self.db.add(record)

    async def _summarize_conversation(self, char: Character, other_char: Character, 
                                       messages: List[ConversationMessage]) -> str:
        if not settings.deepseek_api_key:
            return f"与{other_char.name}的对话"

        conversation_text = "\n".join(
            f"{(char.name if m.author_id == char.id else other_char.name)}: {m.content}"
            for m in messages
        )

        prompt = f"""你是{char.name}，刚刚和{other_char.name}完成了一段对话。请用第一人称简要总结这次对话，并表达你的感受。

对话内容：
{conversation_text}

总结："""

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                response = await client.post(
                    f"{settings.deepseek_base_url}/chat/completions",
                    headers={
                        "Authorization": f"Bearer {settings.deepseek_api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": "deepseek-chat",
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.5,
                        "max_tokens": 200,
                    },
                )

            if response.status_code == 200:
                result = response.json()
                return result["choices"][0]["message"]["content"].strip()
        except Exception:
            pass

        return f"与{other_char.name}的对话"

    def _calculate_importance(self, messages: List[ConversationMessage]) -> float:
        base_score = len(messages) * 0.5
        if len(messages) >= 10:
            base_score += 3.0
        return min(9.0, max(0.0, base_score))

    async def _is_in_conversation(self, char_id: str) -> bool:
        result = await self.db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.char_id == char_id)
            .filter(ConversationMembership.status.in_(["invited", "walkingOver", "participating"]))
        )
        return result.scalar_one_or_none() is not None

    async def _is_recent_conversation(self, char_id: str, other_char_id: str) -> bool:
        result = await self.db.execute(
            select(ParticipationRecord)
            .filter(ParticipationRecord.char_id == char_id)
            .filter(ParticipationRecord.other_char_id == other_char_id)
            .order_by(ParticipationRecord.created_at.desc())
            .limit(1)
        )
        record = result.scalar_one_or_none()

        if record:
            time_diff = (datetime.now() - record.created_at).total_seconds()
            return time_diff < self.CONVERSATION_COOLDOWN

        return False

    async def _get_membership(self, char_id: str, conversation_id: str) -> Optional[ConversationMembership]:
        result = await self.db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.char_id == char_id)
            .filter(ConversationMembership.conversation_id == conversation_id)
        )
        return result.scalar_one_or_none()

    async def _get_memberships(self, conversation_id: str) -> List[ConversationMembership]:
        result = await self.db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.conversation_id == conversation_id)
        )
        return result.scalars().all()

    async def _get_other_members(self, char_id: str, conversation_id: str) -> List[ConversationMembership]:
        result = await self.db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.conversation_id == conversation_id)
            .filter(ConversationMembership.char_id != char_id)
        )
        return result.scalars().all()

    async def _get_messages(self, conversation_id: str) -> List[ConversationMessage]:
        result = await self.db.execute(
            select(ConversationMessage)
            .filter(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.timestamp.asc())
        )
        return result.scalars().all()

    async def _get_last_message(self, conversation_id: str) -> Optional[ConversationMessage]:
        result = await self.db.execute(
            select(ConversationMessage)
            .filter(ConversationMessage.conversation_id == conversation_id)
            .order_by(ConversationMessage.timestamp.desc())
            .limit(1)
        )
        return result.scalar_one_or_none()

    async def _get_related_memories(self, char_id: str, other_char_id: str) -> List[Memory]:
        result = await self.db.execute(
            select(Memory)
            .filter(Memory.char_id == char_id)
            .filter(Memory.type == "conversation")
            .filter(Memory.data.contains({"other_char_id": other_char_id}))
            .order_by(Memory.created_at.desc())
            .limit(3)
        )
        return result.scalars().all()

    async def get_conversation_candidate(self, char_id: str, region: str) -> Optional[str]:
        char = await self.db.get(Character, char_id)
        if not char:
            return None

        result = await self.db.execute(
            select(Character)
            .filter(Character.id != char_id)
            .filter(Character.controller_type == "agent")
            .filter(Character.current_region == region)
            .filter(Character.status == "alive")
        )
        candidates = result.scalars().all()

        import random
        if candidates:
            for candidate in candidates:
                if not await self._is_in_conversation(candidate.id):
                    if not await self._is_recent_conversation(char_id, candidate.id):
                        return candidate.id

        return None
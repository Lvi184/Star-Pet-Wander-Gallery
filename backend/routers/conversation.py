from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.conversation import Conversation, ConversationMembership, ConversationMessage
from models.character import Character
from services.conversation_service import ConversationService
from typing import Dict, Any, List

router = APIRouter(prefix="/conversation", tags=["对话"])


@router.post("/start")
async def start_conversation(data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    initiator_id = data.get("initiator_id")
    target_id = data.get("target_id")

    if not initiator_id or not target_id:
        raise HTTPException(status_code=400, detail="initiator_id 和 target_id 不能为空")

    service = ConversationService(db)
    result = await service.start_conversation(initiator_id, target_id)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{conversation_id}/accept")
async def accept_invite(conversation_id: str, char_id: str, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    result = await service.accept_invite(char_id, conversation_id)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{conversation_id}/reject")
async def reject_invite(conversation_id: str, char_id: str, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    result = await service.reject_invite(char_id, conversation_id)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{conversation_id}/join")
async def join_conversation(conversation_id: str, char_id: str, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    result = await service.join_conversation(char_id, conversation_id)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{conversation_id}/leave")
async def leave_conversation(conversation_id: str, char_id: str, db: AsyncSession = Depends(get_db)):
    service = ConversationService(db)
    result = await service.leave_conversation(char_id, conversation_id)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.post("/{conversation_id}/message")
async def send_message(conversation_id: str, data: Dict[str, Any], db: AsyncSession = Depends(get_db)):
    char_id = data.get("char_id")
    content = data.get("content")

    if not char_id or not content:
        raise HTTPException(status_code=400, detail="char_id 和 content 不能为空")

    service = ConversationService(db)
    result = await service.send_message(char_id, conversation_id, content)

    if result["success"]:
        return result
    else:
        raise HTTPException(status_code=400, detail=result["error"])


@router.get("/{conversation_id}/messages")
async def get_messages(conversation_id: str, limit: int = 50, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConversationMessage)
        .filter(ConversationMessage.conversation_id == conversation_id)
        .order_by(ConversationMessage.timestamp.asc())
        .limit(limit)
    )
    messages = result.scalars().all()

    result = []
    for msg in messages:
        author = await db.get(Character, msg.author_id)
        result.append({
            "id": msg.id,
            "conversation_id": msg.conversation_id,
            "author_id": msg.author_id,
            "author_name": author.name if author else "未知",
            "author_species": author.species if author else "",
            "content": msg.content,
            "timestamp": msg.timestamp.isoformat() if msg.timestamp else None,
            "message_uuid": msg.message_uuid,
        })

    return {"messages": result}


@router.get("/{conversation_id}")
async def get_conversation(conversation_id: str, db: AsyncSession = Depends(get_db)):
    conversation = await db.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="对话不存在")

    members = await db.execute(
        select(ConversationMembership)
        .filter(ConversationMembership.conversation_id == conversation_id)
    )
    memberships = members.scalars().all()

    member_details = []
    for mem in memberships:
        char = await db.get(Character, mem.char_id)
        member_details.append({
            "char_id": mem.char_id,
            "char_name": char.name if char else "未知",
            "char_species": char.species if char else "",
            "status": mem.status,
            "invited_at": mem.invited_at.isoformat() if mem.invited_at else None,
            "joined_at": mem.joined_at.isoformat() if mem.joined_at else None,
            "left_at": mem.left_at.isoformat() if mem.left_at else None,
        })

    return {
        "conversation": conversation.to_dict(),
        "members": member_details,
    }


@router.get("/char/{char_id}/active")
async def get_active_conversation(char_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(ConversationMembership)
        .filter(ConversationMembership.char_id == char_id)
        .filter(ConversationMembership.status.in_(["invited", "walkingOver", "participating"]))
    )
    membership = result.scalar_one_or_none()

    if not membership:
        return {"active_conversation": None}

    conversation = await db.get(Conversation, membership.conversation_id)
    if not conversation:
        return {"active_conversation": None}

    return {
        "active_conversation": {
            "conversation_id": conversation.id,
            "status": membership.status,
            "participants": conversation.participants,
            "num_messages": conversation.num_messages,
            "last_message_at": conversation.last_message_at.isoformat() if conversation.last_message_at else None,
        }
    }


@router.get("/char/{char_id}/history")
async def get_conversation_history(char_id: str, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Conversation)
        .filter(Conversation.participants.contains([char_id]))
        .order_by(Conversation.created_at.desc())
        .limit(limit)
    )
    conversations = result.scalars().all()

    history = []
    for conv in conversations:
        members = await db.execute(
            select(ConversationMembership)
            .filter(ConversationMembership.conversation_id == conv.id)
        )
        memberships = members.scalars().all()

        other_participants = []
        for mem in memberships:
            if mem.char_id != char_id:
                char = await db.get(Character, mem.char_id)
                other_participants.append({
                    "char_id": mem.char_id,
                    "char_name": char.name if char else "未知",
                    "char_species": char.species if char else "",
                })

        history.append({
            "conversation_id": conv.id,
            "created_at": conv.created_at.isoformat() if conv.created_at else None,
            "last_message_at": conv.last_message_at.isoformat() if conv.last_message_at else None,
            "num_messages": conv.num_messages,
            "status": conv.status,
            "other_participants": other_participants,
        })

    return {"history": history}
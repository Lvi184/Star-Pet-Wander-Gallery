from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.diary import Diary
from ai.agents.narrative import narrative_agent
from datetime import datetime

router = APIRouter()


@router.get("/pet/{pet_id}")
async def get_pet_diaries(pet_id: str, skip: int = 0, limit: int = 20, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Diary)
        .where(Diary.pet_id == pet_id)
        .order_by(Diary.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    diaries = result.scalars().all()
    return [
        {
            "id": d.id,
            "title": d.title,
            "content": d.content,
            "scene_image_url": d.scene_image_url,
            "created_at": d.created_at.isoformat() if d.created_at else None,
        }
        for d in diaries
    ]


@router.get("/{entry_id}")
async def get_diary_detail(entry_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Diary).where(Diary.id == entry_id))
    diary = result.scalar_one_or_none()
    if not diary:
        return {"error": "Diary not found"}
    return {
        "id": diary.id,
        "title": diary.title,
        "content": diary.content,
        "scene_image_url": diary.scene_image_url,
        "behavior_chain": diary.behavior_chain or [],
        "created_at": diary.created_at.isoformat() if diary.created_at else None,
    }


@router.post("/pet/{pet_id}")
async def generate_diary(pet_id: str, data: dict, db: AsyncSession = Depends(get_db)):
    result = await narrative_agent(data)

    diary_id = f"diary_{pet_id}_{int(datetime.now().timestamp())}"
    new_diary = Diary(
        id=diary_id,
        pet_id=pet_id,
        title=result.get("title", "今日日记"),
        content=result.get("content", ""),
        scene_image_url=result.get("image_url"),
        behavior_chain=data.get("behavior_chain", []),
    )
    db.add(new_diary)
    await db.commit()

    return {
        "diary_id": diary_id,
        "pet_id": pet_id,
        "date": datetime.now().date().isoformat(),
        "title": new_diary.title,
        "content": new_diary.content,
        "mood": data.get("reflection", {}).get("feeling", "平静"),
        "tags": [e.get("type") for e in data.get("behavior_chain", [])],
        "image_url": new_diary.scene_image_url,
    }

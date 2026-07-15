from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from db.database import get_db
from models.world import WorldRegion

router = APIRouter()


@router.get("/map")
async def get_world_map(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(WorldRegion))
    regions = result.scalars().all()
    return [
        {
            "id": r.id,
            "name": r.name,
            "description": r.description,
            "terrain_type": r.terrain_type,
            "danger_level": r.danger_level,
        }
        for r in regions
    ]


@router.get("/events/active")
async def get_active_events():
    return [
        {
            "id": "meteor",
            "name": "✨ 流星雨",
            "description": "天降灵气，灵兽灵力充盈",
            "event_type": "meteor",
        },
        {
            "id": "tide",
            "name": "🌊 灵气潮汐",
            "description": "天地灵气翻涌，奇遇概率提升",
            "event_type": "tide",
        },
    ]

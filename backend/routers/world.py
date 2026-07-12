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

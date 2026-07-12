from fastapi import APIRouter, Query
from services.festival_service import (
    get_festivals, get_festival, get_upcoming_festivals, trigger_festival, init_festivals
)

router = APIRouter(prefix="/festivals", tags=["festivals"])


@router.get("")
async def list_festivals():
    festivals = await get_festivals()
    return {"festivals": festivals, "total": len(festivals)}


@router.get("/{festival_id}")
async def get_festival_detail(festival_id: str):
    festival = await get_festival(festival_id)
    if not festival:
        return {"error": "Festival not found"}
    return festival


@router.get("/upcoming")
async def list_upcoming_festivals(days: int = Query(30, description="未来天数")):
    festivals = await get_upcoming_festivals(days)
    return {"festivals": festivals, "total": len(festivals)}


@router.post("/{festival_id}/trigger")
async def trigger_festival_event(festival_id: str):
    result = await trigger_festival(festival_id)
    return result


@router.post("/init")
async def initialize_festivals():
    await init_festivals()
    festivals = await get_festivals()
    return {"message": "Festivals initialized", "festivals": festivals, "total": len(festivals)}
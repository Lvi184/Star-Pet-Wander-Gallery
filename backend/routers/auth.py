from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from db.database import get_db

router = APIRouter()


@router.post("/login")
async def login(db: AsyncSession = Depends(get_db)):
    return {"token": "demo-token", "user_id": "demo-user", "nickname": "漫游者"}

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from db.database import init_db
from routers import auth, pet, diary, world, event, festival, character, websocket


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    from services.festival_service import init_festivals
    await init_festivals()
    yield


app = FastAPI(
    title="星宠漫游馆 API",
    description="面向 TRAE AI 创造力大赛的星宠漫游馆后端服务",
    version="0.1.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["认证"])
app.include_router(pet.router, prefix="/pet", tags=["宠物"])
app.include_router(character.router, prefix="/character", tags=["角色"])
app.include_router(diary.router, prefix="/diary", tags=["日记"])
app.include_router(world.router, prefix="/world", tags=["世界"])
app.include_router(event.router, prefix="", tags=["活动"])
app.include_router(festival.router, prefix="", tags=["节日"])
app.include_router(websocket.router)


@app.get("/")
async def root():
    return {"message": "星宠漫游馆 API 服务运行中", "version": "0.1.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}

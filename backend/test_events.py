import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy import select
from models.event import PetEvent
from db.database import Base

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///./test.db', echo=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSession(engine) as session:
        results = await session.execute(
            select(PetEvent).where(PetEvent.char_id == 'char_c9e7fe7b').order_by(PetEvent.timestamp.desc()).limit(20)
        )
        print([e.to_dict() for e in results.scalars().all()])

asyncio.run(test())
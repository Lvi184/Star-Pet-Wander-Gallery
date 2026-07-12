from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import declarative_base
from config import settings

Base = declarative_base()

engine = create_async_engine(settings.database_url, echo=settings.debug)

try:
    from sqlalchemy.ext.asyncio import async_sessionmaker
    async_session = async_sessionmaker(engine, expire_on_commit=False)
except ImportError:
    class AsyncSessionMaker:
        def __init__(self, engine):
            self.engine = engine
        
        async def __aenter__(self):
            self.session = AsyncSession(self.engine, expire_on_commit=False)
            return self.session
        
        async def __aexit__(self, exc_type, exc_val, exc_tb):
            if exc_type is None:
                await self.session.commit()
            else:
                await self.session.rollback()
            await self.session.close()
    
    async_session = AsyncSessionMaker(engine)


async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)


async def get_db() -> AsyncSession:
    async with async_session as session:
        yield session
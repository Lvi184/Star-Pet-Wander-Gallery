import asyncio
import sys
sys.path.insert(0, '.')

from db.database import async_session
from models.pet import Pet


async def create_test_pet():
    async with async_session as session:
        result = await session.execute(
            __import__('sqlalchemy').select(Pet).filter(Pet.id == "test-pet-001")
        )
        existing = result.scalar_one_or_none()
        
        if existing:
            print("测试宠物已存在，跳过创建")
            return existing
        
        pet = Pet(
            id="test-pet-001",
            user_id="user-001",
            name="小星",
            species="星灵猫",
            mood=80,
            energy=70,
            current_region="star-forest",
            inventory=["星光石碎片", "月牙草"],
            personality={"type": "活泼", "description": "充满活力，喜欢探索"},
        )
        session.add(pet)
        await session.commit()
        print("✅ 测试宠物创建成功")
        return pet


async def main():
    print("=" * 50)
    print("星宠漫游馆 - API 测试脚本")
    print("=" * 50)
    
    await create_test_pet()
    
    print("\n🎉 测试环境准备完成！")
    print("🔗 API文档: http://localhost:8000/docs")
    print("🔗 前端页面: http://localhost:3000")
    print("\n可用的测试端点:")
    print("  GET  /pet/test-pet-001/status     - 获取宠物状态")
    print("  GET  /pet/test-pet-001/schedule   - 获取今日日程")
    print("  GET  /pet/test-pet-001/memory/short-term  - 获取短期记忆")
    print("  GET  /pet/test-pet-001/memory/long-term   - 获取长期记忆")
    print("  POST /pet/test-pet-001/memory     - 添加记忆")
    print("  GET  /pet/test-pet-001/memory/summary  - 获取记忆摘要")
    print("  GET  /pet/test-pet-001/events     - 获取事件列表")
    print("  POST /pet/test-pet-001/interact   - 互动（喂食/抚摸）")


if __name__ == "__main__":
    asyncio.run(main())
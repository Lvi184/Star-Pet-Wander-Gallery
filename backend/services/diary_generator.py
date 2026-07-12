from ai.graph import run_pet_behavior_graph


async def generate_diary_for_pet(pet_id: str, pet_state: dict) -> dict:
    """
    为宠物生成一篇完整的漫游日记。
    调用 LangGraph 行为决策图，获取行为链、叙事文本和场景图。
    """
    result = await run_pet_behavior_graph(pet_id, pet_state)
    return {
        "pet_id": pet_id,
        "title": result.get("diary_title", "无名冒险"),
        "content": result.get("diary_text", "..."),
        "scene_image_url": result.get("scene_image_url"),
        "behavior_chain": result.get("behavior_chain", []),
    }

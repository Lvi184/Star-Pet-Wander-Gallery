from typing import TypedDict


class SceneInput(TypedDict):
    narrative_title: str
    narrative_content: str
    region: str
    mood: float


async def scene_agent(data: SceneInput) -> dict:
    """
    场景 Agent：根据叙事内容生成场景描述 Prompt。
    Demo 阶段返回结构化 Prompt，生产环境调用豆包生图 API。
    """
    region = data.get("region", "star-forest")
    mood = data.get("mood", 50)
    title = data.get("narrative_title", "")

    region_desc = {
        "star-forest": "星光森林，树木发出柔和的蓝色光芒，萤火虫飞舞",
        "moon-lake": "月牙湖，平静的湖水倒映着紫色的天空和月亮",
        "crater": "陨石坑，坑底温暖，岩壁上有古老的发光符号",
        "crystal-cave": "水晶洞窟，巨大的水晶柱折射出彩虹光芒",
        "cloud-peaks": "云巅峰，漂浮在云层之上的山峰，云海翻腾",
        "abyss": "深渊裂谷，深不见底的峡谷，底部有微弱的光",
    }

    mood_desc = "梦幻而温馨" if mood > 60 else "神秘而静谧" if mood > 30 else "孤独而深沉"

    prompt = (
        f"一幅奇幻风格的插画，描绘{region_desc.get(region, region)}的场景。"
        f"画面中央有一只可爱的星灵小动物，正在探索这个世界。"
        f"整体氛围{mood_desc}，色彩丰富，细节精致，适合作为冒险日记的配图。"
    )

    return {
        "prompt": prompt,
        "style": "fantasy_illustration",
        "region": region,
    }

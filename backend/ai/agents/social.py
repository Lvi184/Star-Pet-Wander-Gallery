import random
from typing import Dict, List, Optional
from config import settings


SOCIAL_TARGETS = [
    {"name": "小星", "species": "星灵猫", "personality": "活泼"},
    {"name": "小月", "species": "月兔", "personality": "温柔"},
    {"name": "小岩", "species": "石头精灵", "personality": "深沉"},
    {"name": "小闪", "species": "闪电鸟", "personality": "调皮"},
    {"name": "小花", "species": "花精灵", "personality": "傲娇"},
]


async def social_agent(context: Dict) -> Dict:
    pet_name = context.get("pet_name", "小星")
    species = context.get("species", "星灵")
    personality = context.get("personality", {})
    mood = context.get("mood", 70)

    target = random.choice(SOCIAL_TARGETS)

    if mood < 40:
        interaction_type = random.choices(["chat", "help"], weights=[0.6, 0.4])[0]
    elif mood > 70:
        interaction_type = random.choices(["play", "chat", "compete"], weights=[0.4, 0.3, 0.3])[0]
    else:
        interaction_type = random.choices(["meet", "chat", "play"], weights=[0.3, 0.4, 0.3])[0]

    dialogue = await generate_dialogue(
        pet_name, species, personality,
        target["name"], target["species"], target["personality"],
        interaction_type
    )

    mood_change_map = {
        "meet": 5,
        "play": 15,
        "chat": 10,
        "help": 20,
        "compete": 5,
    }

    return {
        "type": interaction_type,
        "detail": f"与{target['name']}({target['species']})进行了{interaction_type}互动",
        "target": target["name"],
        "target_species": target["species"],
        "dialogue": dialogue,
        "mood_change": mood_change_map.get(interaction_type, 10),
        "energy_change": -3,
    }


async def generate_dialogue(
    pet_name: str, pet_species: str, pet_personality: Dict,
    target_name: str, target_species: str, target_personality: str,
    interaction_type: str
) -> List[str]:
    if settings.deepseek_api_key:
        return await _generate_dialogue_with_llm(
            pet_name, pet_species, pet_personality,
            target_name, target_species, target_personality,
            interaction_type
        )
    else:
        return _generate_rule_based_dialogue(
            pet_name, pet_species,
            target_name, target_species,
            interaction_type
        )


async def _generate_dialogue_with_llm(
    pet_name: str, pet_species: str, pet_personality: Dict,
    target_name: str, target_species: str, target_personality: str,
    interaction_type: str
) -> List[str]:
    import httpx

    curiosity = pet_personality.get("curiosity", 50)
    friendliness = pet_personality.get("friendliness", 50)
    adventure = pet_personality.get("adventure", 50)

    interaction_descriptions = {
        "meet": "初次见面打招呼",
        "play": "一起玩耍",
        "chat": "日常聊天",
        "help": "关心对方并提供帮助",
        "compete": "友好竞争比赛",
    }

    prompt = f"""你是{pet_name}，一只{pet_species}。
性格：好奇心={curiosity}，友善度={friendliness}，冒险精神={adventure}

你遇到了{target_name}，一只{target_species}，性格{target_personality}。
你们正在进行{interaction_descriptions.get(interaction_type, '互动')}。

请生成一段简短的对话（2-4句），格式为：
{pet_name}: 对话内容
{target_name}: 对话内容
{pet_name}: 对话内容
...

对话要符合双方性格，简短自然，每句话不超过30个字。"""

    try:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{settings.deepseek_base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {settings.deepseek_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "deepseek-chat",
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.7,
                    "max_tokens": 400,
                },
            )

        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            return _parse_dialogue(content, pet_name, target_name)
    except Exception:
        pass

    return _generate_rule_based_dialogue(
        pet_name, pet_species,
        target_name, target_species,
        interaction_type
    )


def _generate_rule_based_dialogue(
    pet_name: str, pet_species: str,
    target_name: str, target_species: str,
    interaction_type: str
) -> List[str]:
    templates = {
        "meet": [
            f"{pet_name}: 你好呀！我是{pet_species}！",
            f"{target_name}: 你好你好！我是{target_species}，很高兴认识你！",
        ],
        "play": [
            f"{pet_name}: 我们一起玩吧！",
            f"{target_name}: 好呀好呀！来追我呀！",
            f"{pet_name}: 哈哈，你跑得真快！",
        ],
        "chat": [
            f"{pet_name}: 今天天气真好呢！",
            f"{target_name}: 是呀，很适合出来玩！",
            f"{pet_name}: 你最近发现了什么有趣的东西吗？",
            f"{target_name}: 我在星光森林发现了一朵发光的花！",
        ],
        "help": [
            f"{pet_name}: 你看起来有点难过，需要帮忙吗？",
            f"{target_name}: 我迷路了，找不到回家的路...",
            f"{pet_name}: 别担心，我带你回去！",
            f"{target_name}: 谢谢你！你真是太好了！",
        ],
        "compete": [
            f"{pet_name}: 我们来比赛谁先爬到山顶吧！",
            f"{target_name}: 好！我不会输的！",
            f"{pet_name}: 哈哈，我赢了！",
            f"{target_name}: 哼，下次我一定赢！",
        ],
    }

    return templates.get(interaction_type, templates["chat"])


def _parse_dialogue(content: str, pet_name: str, target_name: str) -> List[str]:
    lines = content.strip().split('\n')
    dialogue = []

    for line in lines:
        line = line.strip()
        if f"{pet_name}:" in line or f"{target_name}:" in line:
            dialogue.append(line)

    return dialogue if dialogue else _generate_rule_based_dialogue(
        pet_name, "", target_name, "", "chat"
    )
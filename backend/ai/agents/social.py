import random
from typing import Dict, List


SOCIAL_TARGETS = [
    {"name": "小星", "species": "星灵猫", "personality": "活泼"},
    {"name": "小月", "species": "月兔", "personality": "温柔"},
    {"name": "小岩", "species": "石头精灵", "personality": "深沉"},
    {"name": "小闪", "species": "闪电鸟", "personality": "调皮"},
    {"name": "小花", "species": "花精灵", "personality": "傲娇"},
]

DIALOGUE_TEMPLATES = {
    "meet": [
        "{pet_name}: 你好呀！我是{species}！",
        "{target_name}: 你好你好！我是{target_species}，很高兴认识你！",
    ],
    "play": [
        "{pet_name}: 我们一起玩吧！",
        "{target_name}: 好呀好呀！来追我呀！",
        "{pet_name}: 哈哈，你跑得真快！",
    ],
    "chat": [
        "{pet_name}: 今天天气真好呢！",
        "{target_name}: 是呀，很适合出来玩！",
        "{pet_name}: 你最近发现了什么有趣的东西吗？",
        "{target_name}: 我在星光森林发现了一朵发光的花！",
    ],
    "help": [
        "{pet_name}: 你看起来有点难过，需要帮忙吗？",
        "{target_name}: 我迷路了，找不到回家的路...",
        "{pet_name}: 别担心，我带你回去！",
        "{target_name}: 谢谢你！你真是太好了！",
    ],
    "compete": [
        "{pet_name}: 我们来比赛谁先爬到山顶吧！",
        "{target_name}: 好！我不会输的！",
        "{pet_name}: 哈哈，我赢了！",
        "{target_name}: 哼，下次我一定赢！",
    ],
}


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

    template = DIALOGUE_TEMPLATES.get(interaction_type, DIALOGUE_TEMPLATES["chat"])
    dialogue = [
        line.format(
            pet_name=pet_name,
            species=species,
            target_name=target["name"],
            target_species=target["species"],
        )
        for line in template
    ]

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
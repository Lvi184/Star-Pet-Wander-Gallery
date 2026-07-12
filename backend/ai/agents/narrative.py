import json
import httpx
from typing import List

try:
    from typing import TypedDict
except ImportError:
    from typing_extensions import TypedDict

from config import settings


class NarrativeInput(TypedDict):
    pet_name: str
    species: str
    personality: dict
    behavior_chain: List[dict]
    items_found: List[str]
    mood_change: float
    reflection: dict


async def narrative_agent(data: NarrativeInput) -> dict:
    """
    叙事 Agent：将行为链转化为沉浸式日记文本。
    使用反思结果作为日记的情感内核，生成更有深度的叙事。
    """
    if settings.deepseek_api_key:
        return await _ai_narrative(data)
    return _rule_based_narrative(data)


PERSONALITY_STYLES = {
    "活泼": {
        "description": "充满活力，使用感叹号，语气欢快",
        "keywords": ["超开心", "好棒", "兴奋", "哇", "耶", "太棒了"],
    },
    "温柔": {
        "description": "温柔细腻，使用比喻，语气温柔",
        "keywords": ["轻轻", "慢慢地", "像...一样", "温柔地", "静静地"],
    },
    "傲娇": {
        "description": "口是心非，带点倔强，有点小脾气",
        "keywords": ["才不是", "哼", "才不要", "明明是", "傲娇地"],
    },
    "深沉": {
        "description": "思考深刻，富有哲理，语气沉稳",
        "keywords": ["思考", "感悟", "生命", "时光", "旅程"],
    },
    "调皮": {
        "description": "调皮捣蛋，爱开玩笑，活泼有趣",
        "keywords": ["嘿嘿", "偷偷", "恶作剧", "调皮地", "有趣"],
    },
    "温和": {
        "description": "温和友善，平易近人，语气平和",
        "keywords": ["温暖", "友善", "平和", "安心", "舒适"],
    },
}


def get_personality_style(personality: dict) -> str:
    traits = personality.get("traits", {})
    if traits.get("cheerful", 0) > 0.7:
        return "活泼"
    elif traits.get("gentle", 0) > 0.7:
        return "温柔"
    elif traits.get("tsundere", 0) > 0.7:
        return "傲娇"
    elif traits.get("deep", 0) > 0.7:
        return "深沉"
    elif traits.get("mischievous", 0) > 0.7:
        return "调皮"
    return "温和"


async def _ai_narrative(data: NarrativeInput) -> dict:
    """使用 DeepSeek API 生成情感化日记"""
    pet_name = data.get("pet_name", "小星")
    species = data.get("species", "星灵猫")
    personality = data.get("personality", {})
    chain = data.get("behavior_chain", [])
    items = data.get("items_found", [])
    reflection = data.get("reflection", {})

    events_text = "\n".join([f"- {e.get('type')}: {e.get('detail', '')}" for e in chain])
    items_text = "、".join(items) if items else "无"

    style_name = get_personality_style(personality)
    style_info = PERSONALITY_STYLES.get(style_name, PERSONALITY_STYLES["温和"])

    prompt = f"""
你是一只名叫{pet_name}的{species}。

你的性格：{style_name}（{style_info['description']}）
性格关键词：{', '.join(style_info['keywords'])}

今天的经历：
{events_text}

获得的物品：
{items_text}

今天的反思：
- 总结：{reflection.get('summary', '')}
- 精彩瞬间：{', '.join(reflection.get('highlights', []))}
- 最重要的收获：{reflection.get('most_important', '')}
- 心情：{reflection.get('feeling', '平静')}
- 感悟：{reflection.get('learning', '')}

要求：
1. 用第一人称，口吻要像一只可爱的小动物
2. 日记要有情感，不只是事件罗列
3. 结合反思内容，表达自己的感受
4. 必须符合{style_name}的性格特点，使用相关关键词
5. 篇幅约200-300字
6. 要有一个吸引人的标题

请输出严格的 JSON 格式：
{{
  "title": "日记标题",
  "content": "日记内容",
  "style": "{style_name}"
}}
"""

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
                    "response_format": {"type": "json_object"},
                },
            )

        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            try:
                parsed = json.loads(content)
                return {
                    "title": parsed.get("title", "今日日记"),
                    "content": parsed.get("content", ""),
                    "style": parsed.get("style", "冒险日志"),
                }
            except json.JSONDecodeError:
                pass
    except Exception:
        pass

    return _rule_based_narrative(data)


def _rule_based_narrative(data: NarrativeInput) -> dict:
    """规则引擎回退方案，使用反思结果生成日记"""
    pet_name = data.get("pet_name", "小星")
    chain = data.get("behavior_chain", [])
    items = data.get("items_found", [])
    reflection = data.get("reflection", {})
    mood_change = data.get("mood_change", 0)

    paragraphs = []
    title = reflection.get("most_important", "一次普通的冒险")

    if reflection.get("summary"):
        paragraphs.append(reflection["summary"])
    else:
        for event in chain:
            etype = event.get("type", "")
            detail = event.get("detail", "")
            if etype == "move":
                paragraphs.append("我决定出发，向着新的目的地前进。")
            elif etype == "discover":
                paragraphs.append(f"{detail}，眼前的景象让我屏住了呼吸。")
            elif etype == "encounter":
                paragraphs.append(f"{detail}，它们围绕着我飞舞，像是在欢迎我的到来。")
            elif etype == "find":
                paragraphs.append(f"{detail}，这真是意外的收获。")
            elif etype == "meet":
                paragraphs.append(f"{detail}，我们互相打量着对方。")
            elif etype == "exchange":
                paragraphs.append(f"{detail}，这让我很开心。")
            elif etype == "rest":
                paragraphs.append(f"{detail}，闭上眼感受微风拂过。")
            elif etype == "dream":
                paragraphs.append(f"{detail}，醒来后心情平静了许多。")

    if items:
        item_str = "、".join(items)
        paragraphs.append(f"最后，我把{item_str}小心地收进了背包，这些将成为今天冒险的纪念。")

    feeling = reflection.get("feeling", "平静")
    if feeling == "开心":
        paragraphs.append("今天真是美好的一天，我感觉充满了能量！")
    elif feeling == "低落":
        paragraphs.append("虽然有点累，但这段经历让我成长了不少。")
    else:
        paragraphs.append("今天过得很充实，期待明天的冒险。")

    if reflection.get("learning"):
        paragraphs.append(f"今天我学到了：{reflection['learning']}")

    content = "\n\n".join(paragraphs) if paragraphs else f"{pet_name}今天安静地待了一会儿，什么也没发生。"

    if "discover" in [e.get("type") for e in chain]:
        title = "神秘之地的发现"
    elif "meet" in [e.get("type") for e in chain]:
        title = "一场意外的相遇"
    elif "rest" in [e.get("type") for e in chain]:
        title = "宁静的休憩时光"
    elif "find" in [e.get("type") for e in chain]:
        title = "寻宝之旅"

    return {
        "title": title,
        "content": content,
        "style": "冒险日志",
    }

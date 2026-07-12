import json
import random
import httpx
from typing import List, Optional

try:
    from typing import TypedDict, Literal
except ImportError:
    from typing_extensions import TypedDict, Literal

from config import settings


class BehaviorState(TypedDict):
    pet_id: str
    personality: dict
    current_location: str
    mood: float
    energy: float
    inventory: List[str]
    behavior_chain: List[dict]
    step_count: int
    max_steps: int
    memory_summary: str
    reflection: dict


class PlannerOutput(TypedDict):
    action: Literal["explore", "social", "collect", "rest"]
    target_region: str
    reason: str


class ExplorerOutput(TypedDict):
    events: List[dict]
    items_found: List[str]
    energy_cost: float


class ReflectionOutput(TypedDict):
    summary: str
    highlights: List[str]
    most_important: str
    feeling: str
    learning: str


async def planner_agent(state: BehaviorState) -> PlannerOutput:
    """
    规划 Agent：使用 DeepSeek API 根据宠物性格、状态、位置和记忆决定下一步行为。
    当 API 不可用时，回退到规则引擎。
    """
    if settings.deepseek_api_key:
        return await _ai_planner(state)
    return _rule_based_planner(state)


async def _ai_planner(state: BehaviorState) -> PlannerOutput:
    """使用 DeepSeek API 进行智能规划"""
    personality = state.get("personality", {})
    inventory = state.get("inventory", [])
    memory_summary = state.get("memory_summary", "")

    prompt = f"""
你是一只名叫小星的星灵猫，生活在一个奇幻星球上。

你的性格：好奇心={personality.get('curiosity', 0.8)}，友善度={personality.get('friendliness', 0.6)}

当前状态：
- 位置：{state.get('current_location', '星光森林')}
- 心情：{state.get('mood', 50)}
- 精力：{state.get('energy', 80)}
- 背包：{inventory if inventory else '空'}

最近记忆：
{memory_summary}

可选行动（必须返回英文）：explore、social、collect、rest
可选地点（必须返回英文ID）：star-forest、moon-lake、crater、crystal-cave、cloud-peaks、abyss

请根据性格、状态和记忆，决定你接下来的行动和目的地，并给出一个简短的理由。

请输出严格的 JSON 格式，action必须是英文，target_region必须是地点ID：
{{
  "action": "explore",
  "target_region": "star-forest",
  "reason": "理由"
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
                    "action": parsed.get("action", "explore"),
                    "target_region": parsed.get("target_region", "star-forest"),
                    "reason": parsed.get("reason", "AI决策"),
                }
            except json.JSONDecodeError:
                pass
    except Exception:
        pass

    return _rule_based_planner(state)


def _rule_based_planner(state: BehaviorState) -> PlannerOutput:
    """规则引擎回退方案"""
    energy = state.get("energy", 50)
    mood = state.get("mood", 50)
    inventory = state.get("inventory", [])
    current = state.get("current_location", "star-forest")

    regions = ["star-forest", "moon-lake", "crater", "crystal-cave", "cloud-peaks", "abyss"]
    region_names = {
        "star-forest": "星光森林",
        "moon-lake": "月牙湖",
        "crater": "陨石坑",
        "crystal-cave": "水晶洞窟",
        "cloud-peaks": "云巅峰",
        "abyss": "深渊裂谷",
    }

    if energy < 20:
        action = "rest"
        target = current
    elif mood < 30:
        action = "collect"
        target = random.choice([r for r in regions if r != current])
    elif len(inventory) > 5:
        action = "social"
        target = random.choice([r for r in regions if r != current])
    else:
        action = "explore"
        target = random.choice([r for r in regions if r != current])

    reasons = {
        "explore": "好奇心驱使，想去看看新的地方",
        "social": "背包满了，想去找朋友交换物品",
        "collect": "心情低落，想收集些漂亮的东西",
        "rest": "太累了，需要休息恢复体力",
    }

    return {
        "action": action,
        "target_region": target,
        "reason": reasons[action],
    }


async def explorer_agent(state: BehaviorState) -> ExplorerOutput:
    """探险 Agent：生成具体的探险事件链。"""
    action = state.get("action", "explore")
    target = state.get("target_region", state.get("current_location", "star-forest"))
    region_names = {
        "star-forest": "星光森林",
        "moon-lake": "月牙湖",
        "crater": "陨石坑",
        "crystal-cave": "水晶洞窟",
        "cloud-peaks": "云巅峰",
        "abyss": "深渊裂谷",
    }

    events = []
    items_found = []
    energy_cost = 0.0

    if action == "explore":
        events = [
            {"type": "move", "from": state.get("current_location"), "to": target},
            {"type": "discover", "detail": f"在{region_names.get(target, target)}发现了一处神秘景观"},
            {"type": "encounter", "detail": "遇到了一群发光的萤火虫"},
        ]
        items_found = ["星光石碎片"]
        energy_cost = 15.0
    elif action == "collect":
        events = [
            {"type": "move", "from": state.get("current_location"), "to": target},
            {"type": "search", "detail": f"在{region_names.get(target, target)}仔细搜寻"},
            {"type": "find", "detail": "发现了几株稀有的植物"},
        ]
        items_found = ["月牙草", "紫晶花"]
        energy_cost = 10.0
    elif action == "social":
        events = [
            {"type": "move", "from": state.get("current_location"), "to": target},
            {"type": "meet", "detail": "遇到了另一只流浪的星灵宠物"},
            {"type": "exchange", "detail": "交换了彼此的收藏品"},
        ]
        items_found = ["友谊徽章"]
        energy_cost = 8.0
    elif action == "rest":
        events = [
            {"type": "rest", "detail": "找了一个舒适的地方休息"},
            {"type": "dream", "detail": "做了一个关于遥远星球的梦"},
        ]
        items_found = []
        energy_cost = -20.0

    return {
        "events": events,
        "items_found": items_found,
        "energy_cost": energy_cost,
    }


async def reflection_agent(state: BehaviorState) -> ReflectionOutput:
    """反思 Agent：总结今日经历，为日记提供情感内核。"""
    behavior_chain = state.get("behavior_chain", [])
    memory_summary = state.get("memory_summary", "")

    if settings.deepseek_api_key:
        return await _ai_reflection(behavior_chain, memory_summary)
    return _rule_based_reflection(behavior_chain)


async def _ai_reflection(behavior_chain: List[dict], memory_summary: str) -> ReflectionOutput:
    """使用 DeepSeek API 进行智能反思"""
    events_text = "\n".join([f"- {e.get('type')}: {e.get('detail', '')}" for e in behavior_chain])

    prompt = f"""
你是一只星灵猫，刚刚完成了今天的冒险。请反思今天的经历，回答以下问题：

今天的经历：
{events_text}

最近记忆：
{memory_summary}

请输出严格的 JSON 格式，包含以下字段：
- summary: 简短总结今天做了什么
- highlights: 今天最精彩的2-3个瞬间（数组）
- most_important: 今天最重要的收获
- feeling: 现在的心情（开心/平静/低落）
- learning: 今天学到的经验或感悟
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
                    "temperature": 0.6,
                    "response_format": {"type": "json_object"},
                },
            )

        if response.status_code == 200:
            result = response.json()
            content = result["choices"][0]["message"]["content"]
            try:
                parsed = json.loads(content)
                return {
                    "summary": parsed.get("summary", ""),
                    "highlights": parsed.get("highlights", []),
                    "most_important": parsed.get("most_important", ""),
                    "feeling": parsed.get("feeling", "平静"),
                    "learning": parsed.get("learning", ""),
                }
            except json.JSONDecodeError:
                pass
    except Exception:
        pass

    return _rule_based_reflection(behavior_chain)


def _rule_based_reflection(behavior_chain: List[dict]) -> ReflectionOutput:
    """规则引擎反思方案"""
    event_types = [e.get("type") for e in behavior_chain]
    details = [e.get("detail", "") for e in behavior_chain]

    summary = "今天进行了一次愉快的冒险"

    highlights = []
    if "discover" in event_types:
        highlights.append("发现了新地方")
    if "meet" in event_types:
        highlights.append("遇到了新朋友")
    if "find" in event_types:
        highlights.append("找到了珍贵物品")

    most_important = highlights[0] if highlights else "平安回家"
    feeling = "开心" if highlights else "平静"
    learning = "探索世界总能带来惊喜"

    return {
        "summary": summary,
        "highlights": highlights,
        "most_important": most_important,
        "feeling": feeling,
        "learning": learning,
    }

import json
import asyncio
from datetime import datetime
from typing import Dict, Any, List

try:
    from typing import TypedDict
except ImportError:
    from typing_extensions import TypedDict


class PetGraphState(TypedDict):
    pet_id: str
    pet_name: str
    species: str
    personality: dict
    current_location: str
    mood: float
    energy: float
    inventory: List[str]
    behavior_chain: List[dict]
    memory_summary: str
    reflection: dict
    diary_title: str
    diary_text: str
    scene_image_url: str
    step_count: int
    max_steps: int
    scheduled_activity: str
    current_hour: int


try:
    from langgraph.graph import StateGraph, END

    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False


class SimpleGraph:
    def __init__(self, state_schema):
        self.nodes = {}
        self.edges = []
        self.entry_point = None
        self.conditional_edges = []

    def add_node(self, name, func):
        self.nodes[name] = func

    def set_entry_point(self, name):
        self.entry_point = name

    def add_edge(self, from_node, to_node):
        self.edges.append((from_node, to_node))

    def add_conditional_edges(self, from_node, condition_func, mapping):
        self.conditional_edges.append((from_node, condition_func, mapping))

    def compile(self):
        return SimpleCompiledGraph(self)


class SimpleCompiledGraph:
    def __init__(self, graph):
        self.graph = graph
        self.edge_map = {}
        for from_node, to_node in graph.edges:
            self.edge_map[from_node] = to_node

    async def invoke(self, initial_state: Dict[str, Any], **kwargs):
        state = dict(initial_state)
        current_node = self.graph.entry_point

        while current_node is not None:
            node_func = self.graph.nodes.get(current_node)
            if node_func:
                state = await node_func(state)

            next_node = self.edge_map.get(current_node)
            if next_node is not None:
                current_node = next_node
            else:
                for from_node, condition_func, mapping in self.graph.conditional_edges:
                    if from_node == current_node:
                        result = await condition_func(state)
                        current_node = mapping.get(result)
                        break
                else:
                    current_node = None

        return state


async def schedule_check_step(state: PetGraphState) -> PetGraphState:
    from services.schedule_service import ScheduleService

    current_hour = datetime.now().hour
    state["current_hour"] = current_hour

    scheduled_activity = ScheduleService.decide_activity(
        current_hour, state["energy"], state["mood"]
    )
    state["scheduled_activity"] = scheduled_activity

    state["behavior_chain"].append({
        "type": "schedule_check",
        "detail": f"当前时间{current_hour}:00，根据日程安排进行{scheduled_activity}",
        "scheduled_activity": scheduled_activity,
    })

    return state


async def plan_step(state: PetGraphState) -> PetGraphState:
    from .memory import get_pet_memory

    memory = await get_pet_memory(state["pet_id"])
    memory_summary = await memory.get_weighted_summary(limit=5)

    from .agents.behavior import planner_agent

    result = await planner_agent({
        "pet_name": state["pet_name"],
        "species": state["species"],
        "personality": state["personality"],
        "current_location": state["current_location"],
        "mood": state["mood"],
        "energy": state["energy"],
        "inventory": state["inventory"],
        "memory_summary": memory_summary,
        "scheduled_activity": state.get("scheduled_activity", "explore"),
    })

    state["behavior_chain"].append({
        "type": "plan",
        "detail": f"决定去{result.get('target_region', state['current_location'])}",
        "action": result.get("action", "explore"),
    })

    state["current_location"] = result.get("target_region", state["current_location"])
    state["memory_summary"] = memory_summary

    return state


async def explore_step(state: PetGraphState) -> PetGraphState:
    from .agents.behavior import explorer_agent

    result = await explorer_agent({
        "pet_name": state["pet_name"],
        "species": state["species"],
        "personality": state["personality"],
        "current_location": state["current_location"],
        "mood": state["mood"],
        "energy": state["energy"],
        **{k: v for k, v in state.items() if k in ["action", "target_region"]},
    })

    state["behavior_chain"].append({
        "type": result.get("events", [{}])[0].get("type", "move"),
        "detail": result.get("events", [{}])[0].get("detail", ""),
        "location": result.get("events", [{}])[0].get("to", state["current_location"]),
    })

    if result.get("items_found"):
        for item in result["items_found"]:
            state["inventory"].append(item)
            state["behavior_chain"].append({
                "type": "find",
                "detail": f"发现了{item}",
            })

    state["mood"] = min(100, max(0, state["mood"] + (result.get("mood_change", 0))))
    state["energy"] = max(0, state["energy"] - 5)
    state["step_count"] += 1

    from .memory import get_pet_memory

    memory = await get_pet_memory(state["pet_id"])
    await memory.add_memory(
        f"{state['pet_name']}在{state['current_location']}探险",
        importance=0.6
    )

    return state


async def social_step(state: PetGraphState) -> PetGraphState:
    from .agents.social import social_agent

    result = await social_agent({
        "pet_name": state["pet_name"],
        "species": state["species"],
        "personality": state["personality"],
        "current_location": state["current_location"],
        "mood": state["mood"],
        "energy": state["energy"],
    })

    state["behavior_chain"].append({
        "type": "social",
        "detail": result.get("detail", "进行了社交互动"),
        "target": result.get("target", "另一只宠物"),
        "dialogue": result.get("dialogue", []),
    })

    state["mood"] = min(100, max(0, state["mood"] + (result.get("mood_change", 10))))
    state["energy"] = max(0, state["energy"] - 3)
    state["step_count"] += 1

    from .memory import get_pet_memory

    memory = await get_pet_memory(state["pet_id"])
    await memory.add_memory(
        f"{state['pet_name']}在{state['current_location']}与{result.get('target', '朋友')}进行了社交",
        importance=0.5,
        category="social"
    )

    return state


async def rest_step(state: PetGraphState) -> PetGraphState:
    from services.schedule_service import ScheduleService

    recovery = ScheduleService.get_sleep_recovery(1)

    state["behavior_chain"].append({
        "type": "rest",
        "detail": "休息恢复精力",
        "energy_recovery": recovery["energy_recovery"],
        "mood_recovery": recovery["mood_recovery"],
    })

    state["energy"] = min(100, state["energy"] + recovery["energy_recovery"])
    state["mood"] = min(100, state["mood"] + recovery["mood_recovery"])
    state["step_count"] += 1

    from .memory import get_pet_memory

    memory = await get_pet_memory(state["pet_id"])
    await memory.add_memory(
        f"{state['pet_name']}进行了休息",
        importance=0.3,
        category="rest"
    )

    return state


async def reflect_step(state: PetGraphState) -> PetGraphState:
    from .memory import get_pet_memory
    from .agents.behavior import reflection_agent

    memory = await get_pet_memory(state["pet_id"])
    reflection = await reflection_agent({
        "pet_name": state["pet_name"],
        "species": state["species"],
        "behavior_chain": state["behavior_chain"],
        "memory_summary": state["memory_summary"],
    })

    state["reflection"] = reflection

    await memory.add_memory(
        f"反思：{reflection.get('summary', '')}",
        importance=0.8,
        category="reflection"
    )

    return state


async def narrate_step(state: PetGraphState) -> PetGraphState:
    from .agents.narrative import narrative_agent
    from .memory import get_pet_memory

    result = await narrative_agent({
        "pet_name": state["pet_name"],
        "species": state["species"],
        "personality": state["personality"],
        "behavior_chain": state["behavior_chain"],
        "items_found": state["inventory"],
        "mood_change": state["mood"],
        "reflection": state["reflection"],
    })

    state["diary_title"] = result.get("title", "今日日记")
    state["diary_text"] = result.get("content", "")

    memory = await get_pet_memory(state["pet_id"])
    await memory.add_memory(
        f"日记标题：{state['diary_title']}",
        importance=0.9,
        category="diary"
    )

    return state


async def should_continue(state: PetGraphState) -> str:
    if state["step_count"] >= state["max_steps"]:
        return "end"
    if state["energy"] < 10:
        return "end"
    return "continue"


async def decide_activity_node(state: PetGraphState) -> str:
    scheduled_activity = state.get("scheduled_activity", "explore")

    if scheduled_activity == "sleep":
        return "rest"
    elif scheduled_activity == "social":
        return "social"
    elif scheduled_activity == "rest":
        return "rest"
    elif scheduled_activity == "collect":
        return "explore"
    else:
        return "explore"


async def offline_sync_step(state: PetGraphState) -> PetGraphState:
    from services.world_tick import WorldTickService
    from datetime import datetime, timedelta

    offline_events = await WorldTickService.get_pet_events(state["pet_id"], limit=10)

    for event in offline_events:
        state["behavior_chain"].append({
            "type": event.get("event_type", "unknown"),
            "detail": event.get("detail", ""),
            "location": event.get("location", state["current_location"]),
        })

        state["mood"] = min(100, max(0, state["mood"] + (event.get("mood_change", 0))))
        state["energy"] = max(0, state["energy"] + (event.get("energy_change", 0)))

        if event.get("items_found"):
            for item in event["items_found"]:
                if item not in state["inventory"]:
                    state["inventory"].append(item)

    return state


def create_pet_graph():
    if HAS_LANGGRAPH:
        workflow = StateGraph(PetGraphState)

        workflow.add_node("offline_sync", offline_sync_step)
        workflow.add_node("schedule_check", schedule_check_step)
        workflow.add_node("plan", plan_step)
        workflow.add_node("explore", explore_step)
        workflow.add_node("social", social_step)
        workflow.add_node("rest", rest_step)
        workflow.add_node("reflect", reflect_step)
        workflow.add_node("narrate", narrate_step)

        workflow.set_entry_point("offline_sync")
        workflow.add_edge("offline_sync", "schedule_check")
        workflow.add_edge("schedule_check", "plan")

        workflow.add_conditional_edges(
            "plan",
            decide_activity_node,
            {
                "explore": "explore",
                "social": "social",
                "rest": "rest",
            }
        )

        workflow.add_edge("explore", "reflect")
        workflow.add_edge("social", "reflect")
        workflow.add_edge("rest", "reflect")
        workflow.add_edge("reflect", "narrate")

        workflow.add_conditional_edges(
            "narrate",
            should_continue,
            {
                "continue": "schedule_check",
                "end": END,
            }
        )

        return workflow
    else:
        workflow = SimpleGraph(PetGraphState)

        workflow.add_node("offline_sync", offline_sync_step)
        workflow.add_node("schedule_check", schedule_check_step)
        workflow.add_node("plan", plan_step)
        workflow.add_node("explore", explore_step)
        workflow.add_node("social", social_step)
        workflow.add_node("rest", rest_step)
        workflow.add_node("reflect", reflect_step)
        workflow.add_node("narrate", narrate_step)

        workflow.set_entry_point("offline_sync")
        workflow.add_edge("offline_sync", "schedule_check")
        workflow.add_edge("schedule_check", "plan")

        workflow.add_conditional_edges(
            "plan",
            decide_activity_node,
            {
                "explore": "explore",
                "social": "social",
                "rest": "rest",
            }
        )

        workflow.add_edge("explore", "reflect")
        workflow.add_edge("social", "reflect")
        workflow.add_edge("rest", "reflect")
        workflow.add_edge("reflect", "narrate")

        workflow.add_conditional_edges(
            "narrate",
            should_continue,
            {
                "continue": "schedule_check",
                "end": None,
            }
        )

        return workflow


pet_graph = create_pet_graph()
compiled_graph = pet_graph.compile()
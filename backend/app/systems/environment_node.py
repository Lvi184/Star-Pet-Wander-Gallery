from typing import Dict, Optional, Any, List


try:
    from langgraph.graph import StateGraph, END
    from langchain_core.messages import BaseMessage
    HAS_LANGGRAPH = True
except ImportError:
    HAS_LANGGRAPH = False


class AgentState(Dict):
    messages: List[Dict[str, Any]] = []
    current_realm: Optional[str] = None
    environment_events: List = []
    resource_gravity: Dict = {}
    social_state: Dict = {}


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

    def invoke(self, initial_state: Dict[str, Any], **kwargs):
        state = dict(initial_state)
        current_node = self.graph.entry_point

        while current_node is not None:
            node_func = self.graph.nodes.get(current_node)
            if node_func:
                state = node_func(state)

            next_node = self.edge_map.get(current_node)
            if next_node is not None:
                current_node = next_node
            else:
                for from_node, condition_func, mapping in self.graph.conditional_edges:
                    if from_node == current_node:
                        result = condition_func(state)
                        current_node = mapping.get(result)
                        break
                else:
                    current_node = None

        return state


def check_environment(state: Dict) -> Dict:
    from .environment_events import environment_event_pool
    environment_event_pool.update_events()
    active_events = environment_event_pool.get_active_events_dict()
    state["environment_events"] = active_events

    return state


def apply_resource_gravity(state: Dict) -> Dict:
    from .resource_gravity import resource_gravity_field
    if "current_creature_id" in state:
        gravity = resource_gravity_field.calculate_gravity(state["current_creature_id"])
        attractive = resource_gravity_field.get_attractive_resources(state["current_creature_id"])
        state["resource_gravity"] = {
            "force": gravity,
            "attractive_resources": attractive,
        }

    return state


def update_realm_info(state: Dict) -> Dict:
    from .six_realms import six_realms_graph, RealmType
    if state.get("current_realm"):
        try:
            realm_type = RealmType(state["current_realm"])
            realm = six_realms_graph.get_realm(realm_type)
            if realm:
                state["realm_info"] = realm.to_dict()
                from .environment_events import environment_event_pool
                environment_event_pool.set_region_events(state["current_realm"])
        except ValueError:
            pass

    return state


def decide_next_action(state: Dict) -> str:
    events = state.get("environment_events", [])
    gravity = state.get("resource_gravity", {})

    if events:
        try:
            strongest_event = max(events, key=lambda e: e["intensity"])
            if strongest_event["intensity"] > 0.7:
                return "handle_event"
        except (KeyError, TypeError):
            pass

    attractive = gravity.get("attractive_resources", [])
    if attractive and attractive[0].get("gravity_strength", 0) > 0.5:
        return "move_to_resource"

    return "normal_behavior"


def handle_event(state: Dict) -> Dict:
    events = state.get("environment_events", [])
    if events:
        try:
            strongest_event = max(events, key=lambda e: e["intensity"])
            
            event_type = strongest_event["event_type"]
            responses = {
                "qi_tide": "感受到灵气潮汐的涌动，周围的灵气变得格外充沛，适合修炼",
                "shadow_storm": "暗影风暴正在逼近，需要寻找避难所躲避",
                "meteor_shower": "流星雨划过天际，星光洒落大地，蕴含着宇宙的力量",
                "star_fall": "星辰坠落，天地间充满了神秘的能量波动",
                "blizzard": "暴风雪来袭，气温骤降，需要保暖措施",
                "tsunami": "海啸即将到来，快向高处撤离",
                "formation_fluctuation": "阵法波动异常，附近的空间变得不稳定",
                "star_collapse": "星辰崩塌，宇宙能量剧烈波动，极其危险",
            }

            state["messages"].append({
                "role": "system",
                "content": responses.get(event_type, f"环境事件发生: {event_type}")
            })
        except (KeyError, TypeError):
            pass

    return state


def move_to_resource(state: Dict) -> Dict:
    gravity = state.get("resource_gravity", {})
    attractive = gravity.get("attractive_resources", [])
    
    if attractive:
        target = attractive[0]
        state["messages"].append({
            "role": "system",
            "content": f"被强烈吸引向资源点: {target.get('type', '未知')} (强度: {target.get('gravity_strength', 0):.2f})"
        })
        state["target_resource"] = target

    return state


def normal_behavior(state: Dict) -> Dict:
    state["messages"].append({
        "role": "system",
        "content": "当前环境平静，继续日常活动"
    })
    return state


def create_environment_graph():
    if HAS_LANGGRAPH:
        environment_graph = StateGraph(AgentState)
        end_node = END
    else:
        environment_graph = SimpleGraph(AgentState)
        end_node = None

    environment_graph.add_node("check_environment", check_environment)
    environment_graph.add_node("apply_resource_gravity", apply_resource_gravity)
    environment_graph.add_node("update_realm_info", update_realm_info)
    environment_graph.add_node("decide_next_action", decide_next_action)
    environment_graph.add_node("handle_event", handle_event)
    environment_graph.add_node("move_to_resource", move_to_resource)
    environment_graph.add_node("normal_behavior", normal_behavior)

    environment_graph.set_entry_point("check_environment")

    environment_graph.add_edge("check_environment", "apply_resource_gravity")
    environment_graph.add_edge("apply_resource_gravity", "update_realm_info")
    environment_graph.add_edge("update_realm_info", "decide_next_action")

    environment_graph.add_conditional_edges(
        "decide_next_action",
        lambda state: state.get("next_action") or decide_next_action(state),
        {
            "handle_event": "handle_event",
            "move_to_resource": "move_to_resource",
            "normal_behavior": "normal_behavior",
        }
    )

    environment_graph.add_edge("handle_event", end_node)
    environment_graph.add_edge("move_to_resource", end_node)
    environment_graph.add_edge("normal_behavior", end_node)

    return environment_graph


environment_graph = create_environment_graph()
environment_chain = environment_graph.compile()
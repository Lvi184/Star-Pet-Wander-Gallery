from enum import Enum
from typing import Dict, List, Tuple, Optional
import json

class RealmType(str, Enum):
    QINGQIU = "qingqiu"
    KUNLUN = "kunlun"
    DONGHAI = "donghai"
    YOUDU = "youdu"
    LINGXU = "lingxu"
    XINGHAI = "xinghai"

class Realm:
    def __init__(self, realm_type: RealmType, name: str, description: str, qi_type: str):
        self.realm_type = realm_type
        self.name = name
        self.description = description
        self.qi_type = qi_type
        self.portals: List[Tuple[RealmType, float]] = []
        self.resources: Dict[str, float] = {}
        self.creatures: List[str] = []
        self.event_types: List[str] = []

    def add_portal(self, target_realm: RealmType, weight: float = 1.0):
        self.portals.append((target_realm, weight))

    def add_resource(self, resource_type: str, abundance: float):
        self.resources[resource_type] = abundance

    def to_dict(self):
        return {
            "realm_type": self.realm_type.value,
            "name": self.name,
            "description": self.description,
            "qi_type": self.qi_type,
            "portals": [(p[0].value, p[1]) for p in self.portals],
            "resources": self.resources,
            "creatures": self.creatures,
            "event_types": self.event_types,
        }

class SixRealmsGraph:
    def __init__(self):
        self.realms: Dict[RealmType, Realm] = {}
        self._initialize_realms()
        self._build_connections()

    def _initialize_realms(self):
        self.realms[RealmType.QINGQIU] = Realm(
            RealmType.QINGQIU,
            "青丘",
            "东方青丘之国，九尾狐族的发源地，灵气充沛的森林国度",
            "木"
        )
        self.realms[RealmType.QINGQIU].resources = {
            "spirit_fruit": 0.8,
            "ancient_trees": 0.9,
            "mystic_herbs": 0.7,
            "pure_water": 0.6
        }
        self.realms[RealmType.QINGQIU].event_types = ["qi_tide", "star_fall"]
        self.realms[RealmType.QINGQIU].creatures = ["九尾狐", "青鸾", "白鹿"]

        self.realms[RealmType.KUNLUN] = Realm(
            RealmType.KUNLUN,
            "昆仑",
            "西方昆仑神山，天帝在下界的行宫，冰雪与仙气交织",
            "金"
        )
        self.realms[RealmType.KUNLUN].resources = {
            "celestial_minerals": 0.9,
            "immortal_snow": 0.8,
            "heavenly_pearls": 0.5,
            "ancient_ice": 0.7
        }
        self.realms[RealmType.KUNLUN].event_types = ["meteor_shower", "blizzard"]
        self.realms[RealmType.KUNLUN].creatures = ["凤凰", "麒麟", "冰熊"]

        self.realms[RealmType.DONGHAI] = Realm(
            RealmType.DONGHAI,
            "东海",
            "浩瀚无垠的东方海洋，龙族的栖息之所，蕴含无尽宝藏",
            "水"
        )
        self.realms[RealmType.DONGHAI].resources = {
            "pearls": 0.9,
            "sea_crystals": 0.7,
            "dragon_scale": 0.4,
            "deep_sea_essence": 0.6
        }
        self.realms[RealmType.DONGHAI].event_types = ["tsunami", "deep_current"]
        self.realms[RealmType.DONGHAI].creatures = ["龙族", "鲛人", "鲲鹏"]

        self.realms[RealmType.YOUDU] = Realm(
            RealmType.YOUDU,
            "幽都",
            "北方冥府之都，阴阳交汇的神秘之地，暗影与亡灵的国度",
            "土"
        )
        self.realms[RealmType.YOUDU].resources = {
            "shadow_crystals": 0.8,
            "soul_essence": 0.7,
            "death_flowers": 0.6,
            "dark_energy": 0.9
        }
        self.realms[RealmType.YOUDU].event_types = ["shadow_storm", "soul_tide"]
        self.realms[RealmType.YOUDU].creatures = ["魑魅魍魉", "幽冥犬", "黄泉蛇"]

        self.realms[RealmType.LINGXU] = Realm(
            RealmType.LINGXU,
            "灵墟",
            "南方古老遗迹，上古仙人留下的洞天福地，蕴含强大阵法",
            "火"
        )
        self.realms[RealmType.LINGXU].resources = {
            "ancient_runes": 0.9,
            "formation_cores": 0.6,
            "immortal_remains": 0.5,
            "spiritual_array": 0.8
        }
        self.realms[RealmType.LINGXU].event_types = ["formation_fluctuation", "spirit_quake"]
        self.realms[RealmType.LINGXU].creatures = ["石像鬼", "灵狐", "法阵守卫"]

        self.realms[RealmType.XINGHAI] = Realm(
            RealmType.XINGHAI,
            "星海",
            "浩瀚星空的尽头，星辰之力汇聚之地，神秘而壮丽",
            "虚空"
        )
        self.realms[RealmType.XINGHAI].resources = {
            "star_dust": 0.9,
            "cosmic_essence": 0.8,
            "planet_cores": 0.4,
            "void_crystals": 0.6
        }
        self.realms[RealmType.XINGHAI].event_types = ["star_collapse", "nebula_burst"]
        self.realms[RealmType.XINGHAI].creatures = ["星兽", "银河鱼", "虚空行者"]

    def _build_connections(self):
        connections = [
            (RealmType.QINGQIU, RealmType.LINGXU, 1.0),
            (RealmType.QINGQIU, RealmType.DONGHAI, 0.8),
            (RealmType.KUNLUN, RealmType.XINGHAI, 1.0),
            (RealmType.KUNLUN, RealmType.YOUDU, 0.7),
            (RealmType.DONGHAI, RealmType.QINGQIU, 0.8),
            (RealmType.DONGHAI, RealmType.XINGHAI, 0.6),
            (RealmType.YOUDU, RealmType.KUNLUN, 0.7),
            (RealmType.YOUDU, RealmType.LINGXU, 0.9),
            (RealmType.LINGXU, RealmType.QINGQIU, 1.0),
            (RealmType.LINGXU, RealmType.YOUDU, 0.9),
            (RealmType.XINGHAI, RealmType.KUNLUN, 1.0),
            (RealmType.XINGHAI, RealmType.DONGHAI, 0.6),
        ]

        for source, target, weight in connections:
            self.realms[source].add_portal(target, weight)

    def get_realm(self, realm_type: RealmType) -> Optional[Realm]:
        return self.realms.get(realm_type)

    def get_neighbors(self, realm_type: RealmType) -> List[Tuple[RealmType, float]]:
        realm = self.realms.get(realm_type)
        if not realm:
            return []
        return realm.portals

    def find_path(self, start: RealmType, end: RealmType, max_hops: int = 3) -> List[RealmType]:
        if start == end:
            return [start]

        visited = {start}
        queue = [(start, [start])]

        while queue:
            current, path = queue.pop(0)

            if len(path) > max_hops:
                continue

            for neighbor, _ in self.get_neighbors(current):
                if neighbor == end:
                    return path + [neighbor]

                if neighbor not in visited:
                    visited.add(neighbor)
                    queue.append((neighbor, path + [neighbor]))

        return []

    def get_realm_resources(self, realm_type: RealmType) -> Dict[str, float]:
        realm = self.realms.get(realm_type)
        return realm.resources if realm else {}

    def to_json(self) -> str:
        return json.dumps({
            realm_type.value: realm.to_dict()
            for realm_type, realm in self.realms.items()
        }, ensure_ascii=False, indent=2)

six_realms_graph = SixRealmsGraph()
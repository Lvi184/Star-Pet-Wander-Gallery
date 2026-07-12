import { REGIONS, REGION_NAMES, REGION_DESCRIPTIONS } from './constants';
import { RegionConfig, NPCData } from './zustand/types';

export const regionConfigs: Record<string, RegionConfig> = {
  [REGIONS.QINGQIU]: {
    id: REGIONS.QINGQIU,
    name: REGION_NAMES[REGIONS.QINGQIU],
    description: REGION_DESCRIPTIONS[REGIONS.QINGQIU],
    mapKey: 'qingqiuMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Ground', 'Buildings'],
    collisionProperty: 'collision',
    backgroundColor: '#2d5a27',
  },
  [REGIONS.KUNLUN]: {
    id: REGIONS.KUNLUN,
    name: REGION_NAMES[REGIONS.KUNLUN],
    description: REGION_DESCRIPTIONS[REGIONS.KUNLUN],
    mapKey: 'kunlunMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Ground', 'Mountains'],
    collisionProperty: 'collision',
    backgroundColor: '#6b8e9f',
  },
  [REGIONS.DONGHAI]: {
    id: REGIONS.DONGHAI,
    name: REGION_NAMES[REGIONS.DONGHAI],
    description: REGION_DESCRIPTIONS[REGIONS.DONGHAI],
    mapKey: 'donghaiMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Water', 'Reefs'],
    collisionProperty: 'collision',
    backgroundColor: '#1a5f7a',
  },
  [REGIONS.YOUDU]: {
    id: REGIONS.YOUDU,
    name: REGION_NAMES[REGIONS.YOUDU],
    description: REGION_DESCRIPTIONS[REGIONS.YOUDU],
    mapKey: 'youduMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Ground', 'Walls'],
    collisionProperty: 'collision',
    backgroundColor: '#2c1810',
  },
  [REGIONS.LINGXU]: {
    id: REGIONS.LINGXU,
    name: REGION_NAMES[REGIONS.LINGXU],
    description: REGION_DESCRIPTIONS[REGIONS.LINGXU],
    mapKey: 'lingxuMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Ground', 'Ruins'],
    collisionProperty: 'collision',
    backgroundColor: '#4a4a4a',
  },
  [REGIONS.XINGHAI]: {
    id: REGIONS.XINGHAI,
    name: REGION_NAMES[REGIONS.XINGHAI],
    description: REGION_DESCRIPTIONS[REGIONS.XINGHAI],
    mapKey: 'xinghaiMap',
    tilesetKeys: ['village'],
    tilesetNames: ['village'],
    layerNames: ['Stars', 'Platforms'],
    collisionProperty: 'collision',
    backgroundColor: '#0a0a20',
  },
};

export const npcData: Record<string, NPCData[]> = {
  [REGIONS.QINGQIU]: [
    {
      id: 'fox_ling_er',
      name: '灵儿',
      spriteKey: 'npc_01',
      position: { x: 15, y: 8 },
      direction: 'down',
      dialog: [
        '欢迎来到青丘森林！我是灵儿，一只九尾狐。',
        '这里的灵气很充沛，适合修炼。',
        '如果你迷路了，可以来找我帮忙。',
      ],
      behavior: 'wander',
    },
    {
      id: 'rabbit_tu_tu',
      name: '兔兔',
      spriteKey: 'npc_02',
      position: { x: 8, y: 12 },
      direction: 'up',
      dialog: [
        '胡萝卜...胡萝卜在哪里...',
        '这里的青草很好吃哦！',
      ],
      behavior: 'patrol',
    },
  ],
  [REGIONS.KUNLUN]: [
    {
      id: 'crane_xian',
      name: '仙鹤仙人',
      spriteKey: 'npc_03',
      position: { x: 20, y: 5 },
      direction: 'down',
      dialog: [
        '凡人，你为何来到昆仑仙山？',
        '这里不是寻常人能来的地方...',
        '不过既然来了，就请自便吧。',
      ],
      behavior: 'stand',
    },
  ],
  [REGIONS.DONGHAI]: [
    {
      id: 'dragon_prince',
      name: '小龙子',
      spriteKey: 'npc_04',
      position: { x: 12, y: 15 },
      direction: 'left',
      dialog: [
        '人类，你竟然能来到东海龙宫！',
        '父王说过，有缘人会来到这里。',
        '你要尝尝我们的珍珠吗？',
      ],
      behavior: 'wander',
    },
  ],
  [REGIONS.YOUDU]: [
    {
      id: 'ghost_guard',
      name: '冥府守卫',
      spriteKey: 'npc_05',
      position: { x: 5, y: 10 },
      direction: 'right',
      dialog: [
        '生者止步，这里是幽都冥府。',
        '除非你有特别的理由...',
      ],
      behavior: 'patrol',
    },
  ],
  [REGIONS.LINGXU]: [
    {
      id: 'spirit_keeper',
      name: '遗迹守护者',
      spriteKey: 'npc_01',
      position: { x: 15, y: 20 },
      direction: 'down',
      dialog: [
        '这里是灵墟遗迹，已有千年历史。',
        '里面藏着上古的秘密...',
        '但也有危险的陷阱。',
      ],
      behavior: 'stand',
    },
  ],
  [REGIONS.XINGHAI]: [
    {
      id: 'star_spirit',
      name: '星辰精灵',
      spriteKey: 'npc_02',
      position: { x: 25, y: 15 },
      direction: 'up',
      dialog: [
        '欢迎来到星海苍穹！',
        '每一颗星星都有它的故事...',
        '你想听听吗？',
      ],
      behavior: 'wander',
    },
  ],
};

export const portalLocations: Record<string, { x: number; y: number; targetRegion: string }[]> = {
  [REGIONS.QINGQIU]: [
    { x: 25, y: 10, targetRegion: REGIONS.KUNLUN },
    { x: 10, y: 25, targetRegion: REGIONS.DONGHAI },
  ],
  [REGIONS.KUNLUN]: [
    { x: 5, y: 10, targetRegion: REGIONS.QINGQIU },
    { x: 25, y: 5, targetRegion: REGIONS.XINGHAI },
  ],
  [REGIONS.DONGHAI]: [
    { x: 10, y: 5, targetRegion: REGIONS.QINGQIU },
    { x: 25, y: 15, targetRegion: REGIONS.YOUDU },
  ],
  [REGIONS.YOUDU]: [
    { x: 5, y: 15, targetRegion: REGIONS.DONGHAI },
    { x: 15, y: 25, targetRegion: REGIONS.LINGXU },
  ],
  [REGIONS.LINGXU]: [
    { x: 15, y: 5, targetRegion: REGIONS.YOUDU },
    { x: 25, y: 20, targetRegion: REGIONS.XINGHAI },
  ],
  [REGIONS.XINGHAI]: [
    { x: 5, y: 15, targetRegion: REGIONS.LINGXU },
    { x: 20, y: 5, targetRegion: REGIONS.KUNLUN },
  ],
};

export const mapAssetPaths: Record<string, string> = {
  qingqiuMap: '/assets/game/maps/sample_map.json',
  kunlunMap: '/assets/game/maps/sample_map.json',
  donghaiMap: '/assets/game/maps/sample_map.json',
  youduMap: '/assets/game/maps/sample_indoor.json',
  lingxuMap: '/assets/game/maps/sample_map.json',
  xinghaiMap: '/assets/game/maps/sample_map.json',
};

export const tilesetAssetPaths: Record<string, string> = {
  village: '/assets/game/tilesets/village.png',
  city: '/assets/game/tilesets/city.png',
  objects: '/assets/game/tilesets/objects.png',
};

export const atlasAssetPaths: Record<string, { image: string; json: string }> = {
  hero: {
    image: '/assets/game/atlases/generated/hero.png',
    json: '/assets/game/atlases/generated/hero.json',
  },
  enemy: {
    image: '/assets/game/atlases/generated/enemy.png',
    json: '/assets/game/atlases/generated/enemy.json',
  },
  coin: {
    image: '/assets/game/atlases/generated/coin.png',
    json: '/assets/game/atlases/generated/coin.json',
  },
  npc_01: {
    image: '/assets/game/atlases/generated/npc_01.png',
    json: '/assets/game/atlases/generated/npc_01.json',
  },
  npc_02: {
    image: '/assets/game/atlases/generated/npc_02.png',
    json: '/assets/game/atlases/generated/npc_02.json',
  },
  npc_03: {
    image: '/assets/game/atlases/generated/npc_03.png',
    json: '/assets/game/atlases/generated/npc_03.json',
  },
  npc_04: {
    image: '/assets/game/atlases/generated/npc_04.png',
    json: '/assets/game/atlases/generated/npc_04.json',
  },
  npc_05: {
    image: '/assets/game/atlases/generated/npc_05.png',
    json: '/assets/game/atlases/generated/npc_05.json',
  },
};

export const imageAssetPaths: Record<string, string> = {
  crystal: '/assets/game/images/crystal.png',
  heart_empty: '/assets/game/images/heart_empty.png',
  heart_full: '/assets/game/images/heart_full.png',
  key: '/assets/game/images/key.png',
  a_button: '/assets/game/images/a_button.png',
  b_button: '/assets/game/images/b_button.png',
  d_pad_button: '/assets/game/images/d_pad_button.png',
};

export const fontAssetPaths: Record<string, { ttf: string; png?: string; xml?: string }> = {
  'Press Start 2P': {
    ttf: '/assets/game/fonts/PressStart2P-Regular.ttf',
  },
  'Munro': {
    ttf: '/assets/game/fonts/Munro.ttf',
    png: '/assets/game/fonts/press-start-normal-white.png',
    xml: '/assets/game/fonts/press-start-normal-white.xml',
  },
};

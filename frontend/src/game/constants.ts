export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 16;

export const MIN_GAME_WIDTH = 25 * TILE_WIDTH;
export const MIN_GAME_HEIGHT = 14 * TILE_HEIGHT;

export const RESIZE_THRESHOLD = 500;
export const RE_RESIZE_THRESHOLD = 10;
export const OVERLAY_DIV_RESIZE_THRESHOLD = RE_RESIZE_THRESHOLD;

export const HERO_SPRITE_NAME = 'hero';
export const ENEMY_SPRITE_NAME = 'enemy';
export const COIN_SPRITE_NAME = 'coin';
export const HEART_SPRITE_NAME = 'heart';
export const CRYSTAL_SPRITE_NAME = 'crystal';
export const KEY_SPRITE_NAME = 'key';
export const NPC_SPRITE_NAME = 'npc';

export const ENEMY = 1;
export const COIN = 2;
export const HEART = 3;
export const CRYSTAL = 4;
export const KEY = 5;
export const DOOR = 6;
export const NPC = 7;

export const IDLE_FRAME = 'walk_position_02';
export const IDLE_FRAME_POSITION_KEY = 'position';

export const RIGHT_DIRECTION = 'right';
export const LEFT_DIRECTION = 'left';
export const UP_DIRECTION = 'up';
export const DOWN_DIRECTION = 'down';

export const IGNORED_TILESETS = ['objects'];

export const ENTER_KEY = 'Enter';
export const SPACE_KEY = 'Space';
export const ESCAPE_KEY = 'Escape';
export const ARROW_LEFT_KEY = 'ArrowLeft';
export const ARROW_UP_KEY = 'ArrowUp';
export const ARROW_RIGHT_KEY = 'ArrowRight';
export const ARROW_DOWN_KEY = 'ArrowDown';

export const GAME_CONTENT_ID = 'game-content';

export const BOOT_SCENE_NAME = 'BootScene';

export const DEFAULT_LOCALE = 'zh';

export const REGIONS = {
  QINGQIU: 'qingqiu',
  KUNLUN: 'kunlun',
  DONGHAI: 'donghai',
  YOUDU: 'youdu',
  LINGXU: 'lingxu',
  XINGHAI: 'xinghai',
} as const;

export const REGION_NAMES: Record<string, string> = {
  [REGIONS.QINGQIU]: '青丘森林',
  [REGIONS.KUNLUN]: '昆仑仙山',
  [REGIONS.DONGHAI]: '东海龙宫',
  [REGIONS.YOUDU]: '幽都冥府',
  [REGIONS.LINGXU]: '灵墟遗迹',
  [REGIONS.XINGHAI]: '星海苍穹',
};

export const REGION_DESCRIPTIONS: Record<string, string> = {
  [REGIONS.QINGQIU]: '九尾狐的故乡，灵气充沛的神秘森林',
  [REGIONS.KUNLUN]: '仙人居住的神山，云雾缭绕',
  [REGIONS.DONGHAI]: '龙族的领地，波涛汹涌的海底世界',
  [REGIONS.YOUDU]: '亡灵的归宿，神秘幽暗的冥界',
  [REGIONS.LINGXU]: '上古遗迹，蕴含着古老的秘密',
  [REGIONS.XINGHAI]: '星空之海，传说中的神秘领域',
};

export const INITIAL_HERO_POSITION: Record<string, { x: number; y: number }> = {
  [REGIONS.QINGQIU]: { x: 10, y: 10 },
  [REGIONS.KUNLUN]: { x: 15, y: 8 },
  [REGIONS.DONGHAI]: { x: 12, y: 12 },
  [REGIONS.YOUDU]: { x: 8, y: 10 },
  [REGIONS.LINGXU]: { x: 10, y: 15 },
  [REGIONS.XINGHAI]: { x: 20, y: 15 },
};

export const GAME_SPEED = 60;
export const NPC_SPEED = 30;
export const ANIMATION_FRAME_RATE = 4;

export const FATE_LEVELS = ['peaceful', 'normal', 'dangerous', 'disaster'] as const;
export const FATE_NAMES: Record<string, string> = {
  peaceful: '祥和',
  normal: '平凡',
  dangerous: '凶险',
  disaster: '灾难',
};

export const FATE_COLORS: Record<string, string> = {
  peaceful: '#4ade80',
  normal: '#60a5fa',
  dangerous: '#fbbf24',
  disaster: '#f87171',
};

export const EVENT_TYPES = ['discovery', 'encounter', 'danger', 'treasure', 'story'] as const;

export const DIRECTIONS = [UP_DIRECTION, DOWN_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION];

export const MAX_HEALTH = 100;
export const MAX_ENERGY = 100;
export const MAX_HAPPINESS = 100;
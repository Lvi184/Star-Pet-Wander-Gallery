export interface Position {
  x: number;
  y: number;
}

export type SetState = (partial: unknown) => void;

export type Direction = 'up' | 'down' | 'left' | 'right';

export type RegionId = 'qingqiu' | 'kunlun' | 'donghai' | 'youdu' | 'lingxu' | 'xinghai';

export type FateLevel = 'peaceful' | 'normal' | 'dangerous' | 'disaster';

export type EventType = 'discovery' | 'encounter' | 'danger' | 'treasure' | 'story';

export interface RegionConfig {
  id: RegionId;
  name: string;
  description: string;
  mapKey: string;
  tilesetKeys: string[];
  tilesetNames: string[];
  layerNames: string[];
  collisionProperty: string;
  backgroundColor: string;
  music?: string;
}

export interface CharacterState {
  health: number;
  energy: number;
  happiness: number;
  level: number;
  exp: number;
  gold: number;
}

export interface NPCData {
  id: string;
  name: string;
  spriteKey: string;
  position: Position;
  direction: Direction;
  dialog: string[];
  behavior: 'patrol' | 'stand' | 'wander';
  schedule?: string[];
}

export interface GameEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  regionId: RegionId;
  timestamp: number;
  resolved: boolean;
}

export interface WorldState {
  currentRegion: RegionId;
  fateLevel: FateLevel;
  day: number;
  timeOfDay: string;
  weather: 'sunny' | 'rainy' | 'cloudy' | 'stormy' | 'foggy';
  events: GameEvent[];
}

export interface DialogData {
  messages: string[];
  characterName: string;
  action: (() => void) | null;
}

export interface HeroData {
  facingDirection: Direction;
  initialPosition: Position;
  previousPosition: Position;
  initialFrame: string;
  state: CharacterState;
}

export interface MapData {
  mapKey: string;
  tilesets: string[];
}

export interface GameData {
  width: number;
  height: number;
  zoom: number;
  locale: string;
  canvasElement: HTMLCanvasElement | null;
  cameraSizeUpdateCallbacks: (() => void)[];
}

export interface MenuData {
  items: string[];
  position: 'center' | 'top' | 'bottom';
  onSelect: ((index: number) => void) | null;
}

export interface TextData {
  texts: { key: string; variables: Record<string, unknown>; config: Record<string, unknown> }[];
}

export interface LoadedAssets {
  fonts: string[];
  atlases: string[];
  images: string[];
  maps: string[];
  jsons: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  icon: string;
  quantity: number;
  description: string;
}

export interface WorldLineEvent {
  id: string;
  day: number;
  event: string;
  region: RegionId;
  character: string;
  timestamp: number;
}
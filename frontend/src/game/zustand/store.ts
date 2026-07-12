import { createStore, useStore } from 'zustand';

import { MIN_GAME_HEIGHT, MIN_GAME_WIDTH, DOWN_DIRECTION, IDLE_FRAME, IDLE_FRAME_POSITION_KEY, REGIONS, MAX_HEALTH, MAX_ENERGY, MAX_HAPPINESS } from '../constants';
import { WorldState, CharacterState, InventoryItem, WorldLineEvent } from './types';

import setLoadedAssets from './assets/setLoadedAssets';
import setGameData from './game/setGameData';
import setHeroData from './hero/setHeroData';
import setDialog from './dialog/setDialog';
import setMapData from './map/setMapData';
import setMenu from './menu/setMenu';
import setText from './text/setText';

const initialCharacterState: CharacterState = {
  health: MAX_HEALTH,
  energy: MAX_ENERGY,
  happiness: MAX_HAPPINESS,
  level: 1,
  exp: 0,
  gold: 0,
};

const initialWorldState: WorldState = {
  currentRegion: REGIONS.QINGQIU,
  fateLevel: 'normal',
  day: 1,
  timeOfDay: 'morning',
  weather: 'sunny',
  events: [],
};

const initialInventory: InventoryItem[] = [
  { id: 'crystal', name: '灵气水晶', icon: 'crystal', quantity: 3, description: '蕴含天地灵气的神秘水晶' },
  { id: 'coin', name: '星币', icon: 'coin', quantity: 10, description: '星宠世界的通用货币' },
  { id: 'key', name: '神秘钥匙', icon: 'key', quantity: 1, description: '打开未知之门的钥匙' },
];

const initialWorldLine: WorldLineEvent[] = [
  { id: '1', day: 1, event: '你来到了青丘森林，开始了星宠之旅', region: REGIONS.QINGQIU, character: '玩家', timestamp: Date.now() },
];

const store = createStore((set: any) => ({
  loadedAssets: {
    fonts: [],
    atlases: [],
    images: [],
    maps: [],
    jsons: [],
    setters: setLoadedAssets(set),
  },
  heroData: {
    facingDirection: DOWN_DIRECTION,
    initialPosition: { x: 10, y: 10 },
    previousPosition: { x: 10, y: 10 },
    initialFrame: IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, DOWN_DIRECTION),
    state: initialCharacterState,
    setters: setHeroData(set),
  },
  mapData: {
    mapKey: '',
    tilesets: [],
    setters: setMapData(set),
  },
  game: {
    width: MIN_GAME_WIDTH,
    height: MIN_GAME_HEIGHT,
    zoom: 1,
    locale: 'zh',
    canvasElement: null,
    cameraSizeUpdateCallbacks: [],
    setters: setGameData(set),
  },
  dialog: {
    messages: [],
    action: null,
    characterName: '',
    setters: setDialog(set),
  },
  menu: {
    items: [],
    position: 'center',
    onSelect: null,
    setters: setMenu(set),
  },
  text: {
    texts: [],
    setters: setText(set),
  },
  world: {
    ...initialWorldState,
    setters: {
      setCurrentRegion: (regionId: string) => set((state: any) => ({ world: { ...state.world, currentRegion: regionId } })),
      setFateLevel: (level: string) => set((state: any) => ({ world: { ...state.world, fateLevel: level } })),
      setDay: (day: number) => set((state: any) => ({ world: { ...state.world, day } })),
      setTimeOfDay: (time: string) => set((state: any) => ({ world: { ...state.world, timeOfDay: time } })),
      setWeather: (weather: string) => set((state: any) => ({ world: { ...state.world, weather } })),
      addEvent: (event: any) => set((state: any) => ({ world: { ...state.world, events: [...state.world.events, event] } })),
      resolveEvent: (eventId: string) => set((state: any) => ({
        world: {
          ...state.world,
          events: state.world.events.map(e => e.id === eventId ? { ...e, resolved: true } : e),
        },
      })),
    },
  },
  inventory: {
    items: initialInventory,
    setters: {
      addItem: (item: InventoryItem) => set((state: any) => ({
        inventory: {
          ...state.inventory,
          items: state.inventory.items.some(i => i.id === item.id)
            ? state.inventory.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i)
            : [...state.inventory.items, item],
        },
      })),
      removeItem: (itemId: string, quantity: number = 1) => set((state: any) => ({
        inventory: {
          ...state.inventory,
          items: state.inventory.items
            .map(i => i.id === itemId ? { ...i, quantity: Math.max(0, i.quantity - quantity) } : i)
            .filter(i => i.quantity > 0),
        },
      })),
      clearInventory: () => set((state: any) => ({ inventory: { ...state.inventory, items: [] } })),
    },
  },
  worldLine: {
    events: initialWorldLine,
    setters: {
      addEvent: (event: WorldLineEvent) => set((state: any) => ({
        worldLine: { ...state.worldLine, events: [...state.worldLine.events, event] },
      })),
      clearEvents: () => set((state: any) => ({ worldLine: { ...state.worldLine, events: [] } })),
    },
  },
}));

export const useGameStore = (selector: any) => useStore(store, selector);

export const getState = () => store.getState();

import { SetState } from '../types';

export default (set: SetState) => ({
  setMapKey: (mapKey: string) =>
    set((state: any) => ({
      mapData: {
        ...state.mapData,
        mapKey,
      },
    })),
  addTileset: (tileset: string) =>
    set((state: any) => ({
      mapData: {
        ...state.mapData,
        tilesets: [...state.mapData.tilesets, tileset],
      },
    })),
  setTilesets: (tilesets: string[]) =>
    set((state: any) => ({
      mapData: {
        ...state.mapData,
        tilesets,
      },
    })),
});
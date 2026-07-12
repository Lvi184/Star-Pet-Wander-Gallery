import { SetState } from '../types';

export default (set: SetState) => ({
  addLoadedFont: (font: string) =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        fonts: [...state.loadedAssets.fonts, font],
      },
    })),
  addLoadedAtlas: (atlas: string) =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        atlases: [...state.loadedAssets.atlases, atlas],
      },
    })),
  addLoadedImage: (image: string) =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        images: [...state.loadedAssets.images, image],
      },
    })),
  addLoadedMap: (map: string) =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        maps: [...state.loadedAssets.maps, map],
      },
    })),
  addLoadedJson: (json: string) =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        jsons: [...state.loadedAssets.jsons, json],
      },
    })),
  clearLoadedAssets: () =>
    set((state: any) => ({
      loadedAssets: {
        ...state.loadedAssets,
        fonts: [],
        atlases: [],
        images: [],
        maps: [],
        jsons: [],
      },
    })),
});
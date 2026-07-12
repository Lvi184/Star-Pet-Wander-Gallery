import { SetState } from '../types';

export default (set: SetState) => ({
  setGameWidth: (width: number) =>
    set((state: any) => ({
      game: {
        ...state.game,
        width,
      },
    })),
  setGameHeight: (height: number) =>
    set((state: any) => ({
      game: {
        ...state.game,
        height,
      },
    })),
  setGameZoom: (zoom: number) =>
    set((state: any) => ({
      game: {
        ...state.game,
        zoom,
      },
    })),
  setGameLocale: (locale: string) =>
    set((state: any) => ({
      game: {
        ...state.game,
        locale,
      },
    })),
  setGameCanvasElement: (canvasElement: HTMLCanvasElement | null) =>
    set((state: any) => ({
      game: {
        ...state.game,
        canvasElement,
      },
    })),
  addGameCameraSizeUpdateCallback: (callback: () => void) =>
    set((state: any) => ({
      game: {
        ...state.game,
        cameraSizeUpdateCallbacks: [
          ...state.game.cameraSizeUpdateCallbacks,
          callback,
        ],
      },
    })),
  removeGameCameraSizeUpdateCallback: (callback: () => void) =>
    set((state: any) => ({
      game: {
        ...state.game,
        cameraSizeUpdateCallbacks: state.game.cameraSizeUpdateCallbacks.filter(
          (cb: () => void) => cb !== callback
        ),
      },
    })),
});
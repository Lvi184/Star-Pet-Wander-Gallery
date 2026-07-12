export const selectGameData = (state: any) => state.game;
export const selectGameWidth = (state: any) => state.game.width;
export const selectGameHeight = (state: any) => state.game.height;
export const selectGameZoom = (state: any) => state.game.zoom;
export const selectGameLocale = (state: any) => state.game.locale;
export const selectGameCanvasElement = (state: any) => state.game.canvasElement;
export const selectGameCameraSizeUpdateCallbacks = (state: any) =>
  state.game.cameraSizeUpdateCallbacks;
export const selectGameSetters = (state: any) => state.game.setters;
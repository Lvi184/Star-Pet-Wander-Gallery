import { SetState, Position } from '../types';

export default (set: SetState) => ({
  setHeroFacingDirection: (facingDirection: string) =>
    set((state: any) => ({
      heroData: {
        ...state.heroData,
        facingDirection,
      },
    })),
  setHeroInitialPosition: (initialPosition: Position) =>
    set((state: any) => ({
      heroData: {
        ...state.heroData,
        initialPosition,
      },
    })),
  setHeroPreviousPosition: (previousPosition: Position) =>
    set((state: any) => ({
      heroData: {
        ...state.heroData,
        previousPosition,
      },
    })),
  setHeroInitialFrame: (initialFrame: string) =>
    set((state: any) => ({
      heroData: {
        ...state.heroData,
        initialFrame,
      },
    })),
});
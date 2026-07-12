export const selectHeroData = (state: any) => state.heroData;
export const selectHeroFacingDirection = (state: any) => state.heroData.facingDirection;
export const selectHeroInitialPosition = (state: any) => state.heroData.initialPosition;
export const selectHeroPreviousPosition = (state: any) => state.heroData.previousPosition;
export const selectHeroInitialFrame = (state: any) => state.heroData.initialFrame;
export const selectHeroSetters = (state: any) => state.heroData.setters;
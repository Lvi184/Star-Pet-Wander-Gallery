import { getState } from '../zustand/store';

export const getFileNameWithoutExtension = (fileName: string) => {
  const parts = fileName.split('/');
  const lastPart = parts[parts.length - 1];
  return lastPart.split('.')[0];
};

export const isObject = (obj: unknown) => obj !== null && typeof obj === 'object';

export const isDev = () => {
  return (import.meta as any).env.MODE === 'development';
};

export const getSelectorData = (selector: (state: any) => unknown) => {
  return selector(getState());
};

export const getDegreeFromRadians = (radians: number) => {
  return (radians * 180) / Math.PI;
};

export const rotateRectangleInsideTile = (x: number, y: number, width: number, height: number, degree: number) => {
  const centerX = x + width / 2;
  const centerY = y + height / 2;

  const radian = (degree * Math.PI) / 180;

  const cos = Math.cos(radian);
  const sin = Math.sin(radian);

  const newX = (x - centerX) * cos - (y - centerY) * sin + centerX;
  const newY = (x - centerX) * sin + (y - centerY) * cos + centerY;

  return [newX, newY, width, height];
};

export const createInteractiveGameObject = (
  scene: any,
  x: number,
  y: number,
  width: number,
  height: number,
  origin = { x: 0, y: 0 }
) => {
  const interactiveGameObject = scene.add.rectangle(x, y, width, height);
  interactiveGameObject.setOrigin(origin.x, origin.y);
  scene.physics.add.existing(interactiveGameObject);
  interactiveGameObject.body.setImmovable(true);

  return interactiveGameObject;
};

export const isMapFileAvailable = (_fileName: string) => {
  return true;
};

export const isImageFileAvailable = (_fileName: string) => {
  return true;
};

export const isTilesetFileAvailable = (_fileName: string) => {
  return true;
};

export const isGeneratedAtlasFileAvailable = (_fileName: string) => {
  return true;
};
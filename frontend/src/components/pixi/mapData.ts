import { bgtiles, objmap, animatedsprites, tiledim, tilesetpxw, tilesetpxh } from './gentle.js';

export interface AnimatedSpriteData {
  x: number;
  y: number;
  w: number;
  h: number;
  layer: number;
  sheet: string;
  animation: string;
}

export interface WorldMapData {
  width: number;
  height: number;
  tileSetUrl: string;
  tileSetDimX: number;
  tileSetDimY: number;
  tileDim: number;
  bgTiles: number[][][];
  objectTiles: number[][][];
  animatedSprites: AnimatedSpriteData[];
}

export const gentleMapData: WorldMapData = {
  width: bgtiles[0].length,
  height: bgtiles[0][0].length,
  tileSetUrl: '/ai-town/assets/gentle-obj.png',
  tileSetDimX: 1440,
  tileSetDimY: 1024,
  tileDim: 32,
  bgTiles: bgtiles,
  objectTiles: objmap,
  animatedSprites: animatedsprites,
};
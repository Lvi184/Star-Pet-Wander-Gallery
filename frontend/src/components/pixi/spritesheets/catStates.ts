import { SpritesheetData } from './types';

const FRAME_W = 576;
const FRAME_H = 576;

export const data: SpritesheetData = {
  frames: {
    idle: {
      frame: { x: 0, y: 0, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    idle2: {
      frame: { x: FRAME_W, y: 0, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    idle3: {
      frame: { x: FRAME_W * 2, y: 0, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    happy: {
      frame: { x: 0, y: FRAME_H, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    happy2: {
      frame: { x: FRAME_W, y: FRAME_H, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    happy3: {
      frame: { x: FRAME_W * 2, y: FRAME_H, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    scared: {
      frame: { x: 0, y: FRAME_H * 2, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    scared2: {
      frame: { x: FRAME_W, y: FRAME_H * 2, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    scared3: {
      frame: { x: FRAME_W * 2, y: FRAME_H * 2, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    sleep: {
      frame: { x: 0, y: FRAME_H * 3, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    sleep2: {
      frame: { x: FRAME_W, y: FRAME_H * 3, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
    sleep3: {
      frame: { x: FRAME_W * 2, y: FRAME_H * 3, w: FRAME_W, h: FRAME_H },
      sourceSize: { w: FRAME_W, h: FRAME_H },
      spriteSourceSize: { x: 0, y: 0 },
    },
  },
  animations: {
    idle: ['idle', 'idle2', 'idle3'],
    happy: ['happy', 'happy2', 'happy3'],
    scared: ['scared', 'scared2', 'scared3'],
    sleep: ['sleep', 'sleep2', 'sleep3'],
  },
  meta: {
    scale: '1',
  },
};

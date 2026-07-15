import type { SpritesheetData } from './types';

export const data: SpritesheetData = {
  frames: {
    down:  { frame: { x: 0,    y: 0,    w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    down2: { frame: { x: 32,   y: 0,    w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    down3: { frame: { x: 64,   y: 0,    w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },

    left:  { frame: { x: 0,    y: 32,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    left2: { frame: { x: 32,   y: 32,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    left3: { frame: { x: 64,   y: 32,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },

    right:  { frame: { x: 0,    y: 64,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    right2: { frame: { x: 32,   y: 64,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    right3: { frame: { x: 64,   y: 64,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },

    up:  { frame: { x: 0,    y: 96,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    up2: { frame: { x: 32,   y: 96,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
    up3: { frame: { x: 64,   y: 96,   w: 32, h: 32 }, sourceSize: { w: 32, h: 32 }, spriteSourceSize: { x: 0, y: 0, w: 32, h: 32 }, rotated: false, trimmed: false },
  },
  animations: {
    down:  ['down', 'down2', 'down3'],
    left:  ['left', 'left2', 'left3'],
    right: ['right', 'right2', 'right3'],
    up:    ['up', 'up2', 'up3'],
  },
  meta: {
    image: '/assets/角色图/cat_walk.png',
    size: { w: 96, h: 128 },
    scale: 1,
  }
};

export interface AnimationConfig {
  key: string;
  spritesheet: string;
  frameWidth: number;
  frameHeight: number;
  frameCount: number;
  frameRate: number;
  repeat: number;
}

export const animationConfigs: Record<string, AnimationConfig> = {
  campfire: {
    key: 'campfire',
    spritesheet: '/assets/game/spritesheets/campfire.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    frameRate: 8,
    repeat: -1,
  },
  windmill: {
    key: 'windmill',
    spritesheet: '/assets/game/spritesheets/windmill.png',
    frameWidth: 208,
    frameHeight: 208,
    frameCount: 8,
    frameRate: 10,
    repeat: -1,
  },
  sparkle: {
    key: 'sparkle',
    spritesheet: '/assets/game/spritesheets/gentlesparkle32.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    frameRate: 6,
    repeat: -1,
  },
  waterfall: {
    key: 'waterfall',
    spritesheet: '/assets/game/spritesheets/gentlewaterfall32.png',
    frameWidth: 32,
    frameHeight: 32,
    frameCount: 4,
    frameRate: 6,
    repeat: -1,
  },
};

export function loadAnimationSpritesheets(scene: any) {
  Object.values(animationConfigs).forEach((config) => {
    scene.load.spritesheet(
      config.key,
      config.spritesheet,
      {
        frameWidth: config.frameWidth,
        frameHeight: config.frameHeight,
        endFrame: config.frameCount - 1,
      }
    );
  });
}

export function createAnimatedSprite(
  scene: any,
  animationKey: string,
  x: number,
  y: number,
  scale: number = 1
): any {
  const config = animationConfigs[animationKey];
  if (!config) return null;

  const sprite = scene.add.sprite(x, y, animationKey);
  sprite.setScale(scale);

  scene.anims.create({
    key: `anim_${animationKey}`,
    frames: scene.anims.generateFrameNumbers(animationKey, {
      start: 0,
      end: config.frameCount - 1,
    }),
    frameRate: config.frameRate,
    repeat: config.repeat,
  });

  sprite.anims.play(`anim_${animationKey}`);
  return sprite;
}

export interface AnimatedObject {
  type: string;
  x: number;
  y: number;
  scale?: number;
}

export const mapAnimatedObjects: Record<string, AnimatedObject[]> = {
  qingqiu: [
    { type: 'campfire', x: 400, y: 300, scale: 1 },
    { type: 'windmill', x: 600, y: 200, scale: 0.5 },
    { type: 'waterfall', x: 800, y: 400, scale: 1 },
    { type: 'sparkle', x: 300, y: 250, scale: 0.8 },
    { type: 'sparkle', x: 700, y: 350, scale: 0.8 },
    { type: 'sparkle', x: 500, y: 450, scale: 0.8 },
  ],
};
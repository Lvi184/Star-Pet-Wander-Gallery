import { PixiComponent } from '@pixi/react';
import * as PIXI from 'pixi.js';
import { WorldMapData } from './mapData';
import * as campfire from '../../game/data/animations/campfire.json';
import * as gentlesparkle from '../../game/data/animations/gentlesparkle.json';
import * as gentlewaterfall from '../../game/data/animations/gentlewaterfall.json';
import * as windmill from '../../game/data/animations/windmill.json';
import * as gentlesplash from '../../game/data/animations/gentlesplash.json';

const animations: Record<string, { spritesheet: any; url: string }> = {
  'campfire.json': { spritesheet: campfire, url: '/ai-town/assets/spritesheets/campfire.png' },
  'gentlesparkle.json': {
    spritesheet: gentlesparkle,
    url: '/ai-town/assets/spritesheets/gentlesparkle32.png',
  },
  'gentlewaterfall.json': {
    spritesheet: gentlewaterfall,
    url: '/ai-town/assets/spritesheets/gentlewaterfall32.png',
  },
  'windmill.json': { spritesheet: windmill, url: '/ai-town/assets/spritesheets/windmill.png' },
  'gentlesplash.json': { spritesheet: gentlesplash, url: '/ai-town/assets/spritesheets/gentlewaterfall32.png' },
};

export const PixiStaticMap = PixiComponent('StaticMap', {
  create: (props: { map: WorldMapData; onpointerdown?: any; onpointerup?: any; onpointermove?: any }) => {
    const map = props.map;
    const numxtiles = Math.floor(map.tileSetDimX / map.tileDim);
    const numytiles = Math.floor(map.tileSetDimY / map.tileDim);

    const bt = PIXI.BaseTexture.from(map.tileSetUrl, {
      scaleMode: PIXI.SCALE_MODES.NEAREST,
    });

    const tiles: PIXI.Texture[] = [];
    for (let x = 0; x < numxtiles; x++) {
      for (let y = 0; y < numytiles; y++) {
        tiles[x + y * numxtiles] = new PIXI.Texture(
          bt,
          new PIXI.Rectangle(x * map.tileDim, y * map.tileDim, map.tileDim, map.tileDim)
        );
      }
    }

    const screenxtiles = map.bgTiles[0].length;
    const screenytiles = map.bgTiles[0][0].length;

    const container = new PIXI.Container();
    const allLayers = [...map.bgTiles, ...map.objectTiles];

    for (let i = 0; i < screenxtiles * screenytiles; i++) {
      const x = i % screenxtiles;
      const y = Math.floor(i / screenxtiles);
      const xPx = x * map.tileDim;
      const yPx = y * map.tileDim;

      for (const layer of allLayers) {
        const tileIndex = layer[x][y];
        if (tileIndex === -1) continue;
        const ctile = new PIXI.Sprite(tiles[tileIndex]);
        ctile.x = xPx;
        ctile.y = yPx;
        container.addChild(ctile);
      }
    }

    const spritesBySheet = new Map<string, typeof map.animatedSprites[0][]>();
    for (const sprite of map.animatedSprites) {
      const sheet = sprite.sheet;
      if (!spritesBySheet.has(sheet)) {
        spritesBySheet.set(sheet, []);
      }
      spritesBySheet.get(sheet)!.push(sprite);
    }

    for (const [sheet, sprites] of spritesBySheet.entries()) {
      const animation = animations[sheet];
      if (!animation) {
        console.error('Could not find animation', sheet);
        continue;
      }
      const { spritesheet, url } = animation;
      const texture = PIXI.BaseTexture.from(url, {
        scaleMode: PIXI.SCALE_MODES.NEAREST,
      });
      const spriteSheet = new PIXI.Spritesheet(texture, spritesheet);
      spriteSheet.parse().then(() => {
        for (const sprite of sprites) {
          const pixiAnimation = spriteSheet.animations[sprite.animation];
          if (!pixiAnimation) {
            console.error('Failed to load animation', sprite);
            continue;
          }
          const pixiSprite = new PIXI.AnimatedSprite(pixiAnimation);
          pixiSprite.animationSpeed = 0.1;
          pixiSprite.autoUpdate = true;
          pixiSprite.x = sprite.x;
          pixiSprite.y = sprite.y;
          pixiSprite.width = sprite.w;
          pixiSprite.height = sprite.h;
          container.addChild(pixiSprite);
          pixiSprite.play();
        }
      });
    }

    container.x = 0;
    container.y = 0;

    container.interactive = true;
    container.hitArea = new PIXI.Rectangle(
      0,
      0,
      screenxtiles * map.tileDim,
      screenytiles * map.tileDim
    );

    if (props.onpointerdown) {
      container.on('pointerdown', props.onpointerdown);
    }
    if (props.onpointerup) {
      container.on('pointerup', props.onpointerup);
    }
    if (props.onpointermove) {
      container.on('pointermove', props.onpointermove);
    }

    return container;
  },
  applyProps: (instance: PIXI.Container, oldProps: any, newProps: any) => {
    if (newProps.onpointerdown && oldProps.onpointerdown !== newProps.onpointerdown) {
      instance.off('pointerdown', oldProps.onpointerdown);
      instance.on('pointerdown', newProps.onpointerdown);
    }
    if (newProps.onpointerup && oldProps.onpointerup !== newProps.onpointerup) {
      instance.off('pointerup', oldProps.onpointerup);
      instance.on('pointerup', newProps.onpointerup);
    }
    if (newProps.onpointermove && oldProps.onpointermove !== newProps.onpointermove) {
      instance.off('pointermove', oldProps.onpointermove);
      instance.on('pointermove', newProps.onpointermove);
    }
  },
});
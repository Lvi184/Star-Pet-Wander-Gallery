import { GameObjects, Input, Physics } from 'phaser';

export interface GameScene extends Phaser.Scene {
  actionKey?: Input.Keyboard.Key;
  cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  wasd?: Record<string, Input.Keyboard.Key>;
  sprites?: GameObjects.Group;
  enemies?: GameObjects.Group;
  items?: GameObjects.Group;
  mapLayers?: GameObjects.Group;
  map?: Phaser.Tilemaps.Tilemap;
  heroSprite?: Physics.Arcade.Sprite & {
    actionCollider?: GameObjects.Rectangle;
    update: (time?: number, delta?: number) => void;
  };
}

export interface AssetItem {
  key: string;
  url: string;
  type?: string;
}

export interface AssetsToLoad {
  maps?: AssetItem[];
  images?: AssetItem[];
  atlases?: AssetItem[];
  fonts?: string[];
  jsons?: AssetItem[];
}
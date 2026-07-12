import { Scene } from 'phaser';

export default class BootScene extends Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.tilemapTiledJSON('townMap', '/assets/game/maps/tilemap.json');
    this.load.tilemapTiledJSON('forestMap', '/assets/game/maps/sample_map.json');
    this.load.tilemapTiledJSON('lakeMap', '/assets/game/maps/sample_map.json');
    this.load.tilemapTiledJSON('craterMap', '/assets/game/maps/sample_map.json');
    this.load.tilemapTiledJSON('caveMap', '/assets/game/maps/sample_indoor.json');

    this.load.image('rpg-tileset', '/assets/game/tilesets/rpg-tileset.png');
    this.load.image('village', '/assets/game/tilesets/village.png');
    this.load.image('city', '/assets/game/tilesets/city.png');

    this.load.atlas('hero', '/assets/atlases/generated/hero.png', '/assets/atlases/generated/hero.json');
  }

  create() {
    this.scene.start('GameScene');
  }
}
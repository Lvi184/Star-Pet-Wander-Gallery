import { Scene } from 'phaser';

import {
  handleCreateControls,
  handleCreateGroups,
  handleCreateMap,
  handleCreateHero,
  handleObjectsLayer,
  handleHeroMovement,
  handleConfigureCamera,
  handleCreateHeroAnimations,
  handleNPCMovement,
  createNPC,
  createPortal,
} from '../utils/sceneHelpers';

import { getSelectorData } from '../utils/utils';
import { selectGameSetters } from '../zustand/game/selectGameData';
import { selectMapSetters } from '../zustand/map/selectMapData';
import { regionConfigs, npcData, portalLocations } from '../config';
import { REGION_NAMES, TILE_WIDTH, TILE_HEIGHT, GAME_SPEED } from '../constants';
import { PetEventBridge } from '../bridges/PetEventBridge';
import { findRoute, Point } from '../utils/pathfinding';
import { loadAnimationSpritesheets, createAnimatedSprite, mapAnimatedObjects } from '../utils/animationHelpers';

export default class GameScene extends Scene {
  private _currentRegion: string = 'qingqiu';
  private petEventBridge!: PetEventBridge;

  constructor() {
    super('GameScene');
  }

  init(data: { location?: string }) {
    if (data.location) {
      this._currentRegion = data.location;
    }
  }

  preload() {
    loadAnimationSpritesheets(this);
    this.loadPetImages();
  }

  private loadPetImages() {
    const petImages = [
      'pets/哈基咪.webp',
      'pets/妙脆角咪.png',
      'pets/月薪咪.webp',
      'pets/香蕉猫.gif',
      'pets/刀盾.JPG',
      'pets/蜘蛛咪.webp',
      'pets/绿色外星咪.webp',
      'pets/月薪咪F4.webp',
      'pets/月薪咪吓.webp',
    ];
    petImages.forEach((path) => {
      const key = path.replace('/pets/', '').replace(/\.[^/.]+$/, '');
      this.load.image(key, path);
    });
  }

  create() {
    const { addGameCameraSizeUpdateCallback } = getSelectorData(selectGameSetters);
    const { setTilesets, setMapKey } = getSelectorData(selectMapSetters);
    const regionConfig = regionConfigs[this._currentRegion];

    if (regionConfig) {
      setMapKey(regionConfig.mapKey);
      setTilesets(regionConfig.tilesetKeys);
    }

    handleCreateControls(this);
    handleCreateGroups(this);

    const customColliders = handleCreateMap(this);

    handleCreateHero(this);

    handleObjectsLayer(this);

    this.createNPCs();
    this.createPortals();

    handleConfigureCamera(this);
    addGameCameraSizeUpdateCallback(() => {
      handleConfigureCamera(this);
    });

    handleCreateHeroAnimations(this);

    this.physics.add.collider(this.heroSprite, this.enemies);
    this.physics.add.collider(this.heroSprite, customColliders);

    this.addRegionLabel();

    this.petEventBridge = new PetEventBridge(this);
    this.petEventBridge.init();

    this.createAnimatedObjects();

    this.setupClickToMove();
  }

  private createAnimatedObjects() {
    const objects = mapAnimatedObjects[this._currentRegion] || [];
    objects.forEach((obj) => {
      createAnimatedSprite(this, obj.type, obj.x, obj.y, obj.scale);
    });
  }

  private _movePath: Point[] = [];
  private _moveSpeed = 3 * GAME_SPEED;

  private setupClickToMove() {
    this.input.on('pointerup', (pointer: any) => {
      if (!this.heroSprite || !this.map) return;

      if (this.wasDragging && this.wasDragging()) {
        return;
      }

      const worldPoint = this.cameras.main.getWorldPoint(pointer.x, pointer.y);

      const start: Point = { x: this.heroSprite.x, y: this.heroSprite.y };
      const destination: Point = { x: worldPoint.x, y: worldPoint.y };

      const path = findRoute(
        this.map,
        start,
        destination,
        [],
        TILE_WIDTH,
        TILE_HEIGHT
      );

      if (path && path.length > 0) {
        this._movePath = path;
      }
    });
  }

  private moveAlongPath() {
    if (!this.heroSprite || this._movePath.length === 0) return;

    const target = this._movePath[0];
    const dx = target.x - this.heroSprite.x;
    const dy = target.y - this.heroSprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 5) {
      this._movePath.shift();
      if (this._movePath.length === 0) {
        this.heroSprite.anims.stop();
      }
      return;
    }

    const speed = this._moveSpeed;
    const vx = (dx / distance) * speed;
    const vy = (dy / distance) * speed;

    this.heroSprite.x += vx;
    this.heroSprite.y += vy;

    if (Math.abs(dx) > Math.abs(dy)) {
      this.heroSprite.anims.play(dx > 0 ? `walk_right` : `walk_left`, true);
    } else {
      this.heroSprite.anims.play(dy > 0 ? `walk_down` : `walk_up`, true);
    }
  }

  createNPCs() {
    const npcs = npcData[this._currentRegion] || [];

    npcs.forEach((npcItem) => {
      createNPC(this, npcItem);
    });
  }

  createPortals() {
    const portals = portalLocations[this._currentRegion] || [];

    portals.forEach((portal) => {
      createPortal(this, portal.x, portal.y, portal.targetRegion);
    });
  }

  addRegionLabel() {
    const regionName = REGION_NAMES[this._currentRegion] || this._currentRegion;
    const regionConfig = regionConfigs[this._currentRegion];

    if (regionConfig) {
      this.cameras.main.setBackgroundColor(regionConfig.backgroundColor);
    }

    this.add.text(10, 10, regionName, {
      fontSize: '16px',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 2,
      fontFamily: '"Press Start 2P"',
    }).setScrollFactor(0);
  }

  update(time: number, delta: number) {
    if (this._movePath.length === 0) {
      handleHeroMovement(this);
    } else {
      this.moveAlongPath();
    }

    if (this.heroSprite) {
      this.heroSprite.update(time, delta);
    }

    if (this.npcs) {
      this.npcs.getChildren().forEach((npc: any) => {
        handleNPCMovement(this, npc);
      });
    }

    if (this.petEventBridge) {
      this.petEventBridge.updatePlayerControl(delta);
    }
  }
}

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
import { regionConfigs, npcData, portalLocations } from '../config';
import { REGION_NAMES } from '../constants';

export default class GameScene extends Scene {
  private sceneRef: any;
  private currentRegion: string = 'qingqiu';

  constructor() {
    super('GameScene');
  }

  init(data: { location?: string }) {
    if (data.location) {
      this.currentRegion = data.location;
    }
  }

  preload() {}

  create() {
    this.sceneRef = this;

    const { addGameCameraSizeUpdateCallback } = getSelectorData(selectGameSetters);

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
  }

  createNPCs() {
    const npcs = npcData[this.currentRegion] || [];

    npcs.forEach((npcItem) => {
      createNPC(this, npcItem);
    });
  }

  createPortals() {
    const portals = portalLocations[this.currentRegion] || [];

    portals.forEach((portal) => {
      createPortal(this, portal.x, portal.y, portal.targetRegion);
    });
  }

  addRegionLabel() {
    const regionName = REGION_NAMES[this.currentRegion] || this.currentRegion;
    const regionConfig = regionConfigs[this.currentRegion];

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
    handleHeroMovement(this);

    if (this.heroSprite) {
      this.heroSprite.update(time, delta);
    }

    if (this.npcs) {
      this.npcs.getChildren().forEach((npc: any) => {
        handleNPCMovement(this, npc);
      });
    }
  }
}

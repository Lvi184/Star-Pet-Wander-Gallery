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
import { PetEventBridge } from '../bridges/PetEventBridge';
import { EnvironmentFXSystem } from '../systems/EnvironmentFXSystem';
import { eventBus, GAME_EVENTS } from '../eventBus';

const EVENT_TYPE_MAP: Record<string, string> = {
  meteor: 'meteor_shower',
  tide: 'qi_tide',
  starfall: 'star_fall',
  shadow: 'shadow_storm',
};

export default class GameScene extends Scene {
  private _currentRegion: string = 'qingqiu';
  private petEventBridge!: PetEventBridge;
  private environmentFX!: EnvironmentFXSystem;

  constructor() {
    super('GameScene');
  }

  init(data: { location?: string }) {
    if (data.location) {
      this._currentRegion = data.location;
    }
  }

  preload() {}

  create() {
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

    this.petEventBridge = new PetEventBridge(this);
    this.petEventBridge.init();

    this.environmentFX = new EnvironmentFXSystem(this);
    this.setupEnvironmentEventListener();
  }

  private setupEnvironmentEventListener() {
    eventBus.on(GAME_EVENTS.ENVIRONMENT_EVENT, (data: any) => {
      const fxType = EVENT_TYPE_MAP[data.eventType] || data.eventType;
      if (data.action === 'start') {
        this.environmentFX.addEvent({
          type: fxType,
          intensity: 1,
          duration: 4000,
        });
      } else if (data.action === 'end') {
        this.environmentFX.removeEvent(fxType);
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.environmentFX.destroy();
    });
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
    handleHeroMovement(this);

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

    if (this.environmentFX) {
      this.environmentFX.update();
    }
  }
}

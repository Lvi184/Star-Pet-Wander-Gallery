import { eventBus, GAME_EVENTS } from '../eventBus';
import { Scene } from 'phaser';

const SPECIES_COLORS: Record<string, number> = {
  fox: 0xff6b9d,
  dragon: 0x8b5cf6,
  phoenix: 0xf59e0b,
  turtle: 0x10b981,
  cat: 0xfbbf24,
  狐狸: 0xff6b9d,
  龙族: 0x8b5cf6,
  凤凰: 0xf59e0b,
  灵龟: 0x10b981,
  星灵猫: 0xfbbf24,
};

const FALLBACK_COLOR = 0xa78bfa;

interface PetSprite {
  id: string;
  sprite: Phaser.GameObjects.Container;
  region: string | null;
  tween?: Phaser.Tweens.Tween;
}

export class PetEventBridge {
  private scene: Scene;
  private pets: Map<string, PetSprite> = new Map();
  private currentPetId: string | null = null;
  private playerControlEnabled: boolean = false;
  private playerPetId: string | null = null;
  private cursors?: Phaser.Types.Input.Keyboard.CursorKeys;
  private playerSpeed: number = 180;
  private boundEvents: Array<{ event: string; handler: (d: any) => void }> = [];

  constructor(scene: Scene) {
    this.scene = scene;
  }

  init() {
    this.cursors = this.scene.input.keyboard?.createCursorKeys();

    this.bind(GAME_EVENTS.SPAWN_PET, (data: any) => this.handleSpawnPet(data));
    this.bind(GAME_EVENTS.MOVE_PET, (data: any) => this.handleMovePet(data));
    this.bind(GAME_EVENTS.FOCUS_PET, (data: any) => this.handleFocusPet(data));
    this.bind(GAME_EVENTS.CONTROL_CHANGE, (data: any) => this.handleControlChange(data));
    this.bind(GAME_EVENTS.CONTROL_SWITCH, (data: any) => this.handleControlChange(data));

    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.scene.events.once(Phaser.Scenes.Events.DESTROY, this.destroy, this);

    eventBus.emit(GAME_EVENTS.SCENE_READY, { scene: 'GameScene' });
  }

  private bind(event: string, handler: (data: any) => void) {
    eventBus.on(event, handler);
    this.boundEvents.push({ event, handler });
  }

  private handleSpawnPet(data: { pets: Array<{ id: string; name: string; species: string; current_region?: string | null }> }) {
    data.pets.forEach((pet) => {
      if (this.pets.has(pet.id)) return;
      const color = SPECIES_COLORS[pet.species] || FALLBACK_COLOR;

      const container = this.scene.add.container(0, 0);

      const glow = this.scene.add.circle(0, 0, 22, color, 0.25);
      const body = this.scene.add.circle(0, 0, 14, color, 0.9);
      body.setStrokeStyle(2, 0xffffff, 0.6);

      container.add([glow, body]);
      container.setSize(32, 32);

      this.scene.tweens.add({
        targets: glow,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.3, to: 0.1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      this.pets.set(pet.id, {
        id: pet.id,
        sprite: container,
        region: pet.current_region || null,
      });

      if (pet.current_region) {
        this.placePetInRegion(pet.id, pet.current_region);
      }
    });
  }

  private handleMovePet(data: { petId: string; region: string }) {
    const pet = this.pets.get(data.petId);
    if (!pet) return;
    this.placePetInRegion(data.petId, data.region);
  }

  private placePetInRegion(petId: string, regionId: string) {
    const pet = this.pets.get(petId);
    if (!pet) return;

    const centerX = this.scene.scale.width / 2 + (Math.random() - 0.5) * 300;
    const centerY = this.scene.scale.height / 2 + (Math.random() - 0.5) * 200;

    if (pet.tween) {
      pet.tween.stop();
    }

    pet.tween = this.scene.tweens.add({
      targets: pet.sprite,
      x: centerX,
      y: centerY,
      duration: 1200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        pet.tween = undefined;
      },
    });

    pet.region = regionId;

    eventBus.emit(GAME_EVENTS.PET_POSITION_UPDATE, {
      petId,
      x: pet.sprite.x,
      y: pet.sprite.y,
      region: regionId,
    });
  }

  private handleFocusPet(data: { petId: string }) {
    const pet = this.pets.get(data.petId);
    if (!pet || !pet.sprite) return;
    this.currentPetId = data.petId;

    this.scene.cameras.main.startFollow(pet.sprite, true, 0.08, 0.08);
  }

  private handleControlChange(data: { petId: string; controllerType: 'player' | 'agent' }) {
    if (data.controllerType === 'player') {
      this.playerControlEnabled = true;
      this.playerPetId = data.petId;
      this.scene.cameras.main.startFollow(this.pets.get(data.petId)?.sprite!, true, 0.08, 0.08);
    } else {
      this.playerControlEnabled = false;
      this.playerPetId = null;
    }
  }

  updatePlayerControl(delta: number) {
    if (!this.playerControlEnabled || !this.playerPetId || !this.cursors) return;
    const pet = this.pets.get(this.playerPetId);
    if (!pet) return;

    let vx = 0;
    let vy = 0;

    if (this.cursors.left?.isDown || this.scene.input.keyboard?.addKey('A').isDown) vx -= 1;
    if (this.cursors.right?.isDown || this.scene.input.keyboard?.addKey('D').isDown) vx += 1;
    if (this.cursors.up?.isDown || this.scene.input.keyboard?.addKey('W').isDown) vy -= 1;
    if (this.cursors.down?.isDown || this.scene.input.keyboard?.addKey('S').isDown) vy += 1;

    if (vx !== 0 || vy !== 0) {
      const speed = this.playerSpeed * (delta / 1000);
      pet.sprite.x += vx * speed;
      pet.sprite.y += vy * speed;

      eventBus.emit(GAME_EVENTS.PET_ACTIVITY, {
        petId: this.playerPetId,
        x: pet.sprite.x,
        y: pet.sprite.y,
      });
    }
  }

  destroy() {
    this.boundEvents.forEach(({ event, handler }) => {
      eventBus.off(event, handler);
    });
    this.boundEvents = [];
    this.pets.clear();
  }
}

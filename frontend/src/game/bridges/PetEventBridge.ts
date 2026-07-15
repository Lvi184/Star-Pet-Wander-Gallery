import { eventBus, GAME_EVENTS } from '../eventBus';
import { Scene } from 'phaser';
import { usePetStore } from '../../stores/petStore';

const SPECIES_COLORS: Record<string, number> = {
  fox: 0xff6b9d,
  dragon: 0x8b5cf6,
  phoenix: 0xf59e0b,
  turtle: 0x10b981,
  tiger: 0xef4444,
  qilin: 0xfbbf24,
  cat: 0xfbbf24,
  狐狸: 0xff6b9d,
  龙族: 0x8b5cf6,
  凤凰: 0xf59e0b,
  灵龟: 0x10b981,
  星灵猫: 0xfbbf24,
};

const SPECIES_IMAGES: Record<string, string[]> = {
  fox: ['哈基咪', '妙脆角咪'],
  dragon: ['香蕉猫', '月薪咪'],
  phoenix: ['月薪咪F4', '绿色外星咪'],
  turtle: ['刀盾', '蜘蛛咪'],
  tiger: ['月薪咪吓', '哈基咪'],
  qilin: ['妙脆角咪', '绿色外星咪'],
  cat: ['哈基咪', '妙脆角咪'],
};

const FALLBACK_COLOR = 0xa78bfa;

interface PetSprite {
  id: string;
  sprite: Phaser.GameObjects.Container;
  imageSprite: Phaser.GameObjects.Sprite | null;
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

    setTimeout(() => {
      const { pets } = usePetStore.getState();
      if (pets.length > 0) {
        this.handleSpawnPet({ pets });
      }
    }, 500);

    eventBus.emit(GAME_EVENTS.SCENE_READY, { scene: 'GameScene' });
  }

  private bind(event: string, handler: (data: any) => void) {
    eventBus.on(event, handler);
    this.boundEvents.push({ event, handler });
  }

  private handleSpawnPet(data: { pets: Array<{ id: string; name: string; species: string; current_region?: string | null }> }) {
    console.log('PetEventBridge: handleSpawnPet called with', data.pets.length, 'pets');
    data.pets.forEach((pet) => {
      if (this.pets.has(pet.id)) return;
      console.log('Spawning pet:', pet.name, 'species:', pet.species);
      const color = SPECIES_COLORS[pet.species] || FALLBACK_COLOR;
      const images = SPECIES_IMAGES[pet.species] || SPECIES_IMAGES.cat;
      const imageKey = images[Math.floor(Math.random() * images.length)];
      console.log('Using image key:', imageKey, 'texture exists:', this.scene.textures.exists(imageKey));

      const container = this.scene.add.container(0, 0);

      const glow = this.scene.add.circle(0, 0, 24, color, 0.3);
      this.scene.tweens.add({
        targets: glow,
        scale: { from: 1, to: 1.4 },
        alpha: { from: 0.4, to: 0.1 },
        duration: 2000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      let imageSprite: Phaser.GameObjects.Sprite | null = null;
      if (this.scene.textures.exists(imageKey)) {
        imageSprite = this.scene.add.sprite(0, 0, imageKey);
        imageSprite.setScale(0.18);
        imageSprite.setOrigin(0.5, 0.5);
      }

      if (!imageSprite) {
        const body = this.scene.add.circle(0, 0, 14, color, 0.9);
        body.setStrokeStyle(2, 0xffffff, 0.6);
        container.add([glow, body]);
      } else {
        container.add([glow, imageSprite]);
      }

      container.setSize(32, 32);

      const nameLabel = this.scene.add.text(0, -30, pet.name, {
        fontSize: '12px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 2,
        fontFamily: '"Press Start 2P"',
      }).setOrigin(0.5, 0);
      container.add(nameLabel);

      this.pets.set(pet.id, {
        id: pet.id,
        sprite: container,
        imageSprite,
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

      if (pet.imageSprite) {
        if (vx < 0) pet.imageSprite.flipX = true;
        else if (vx > 0) pet.imageSprite.flipX = false;
      }

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
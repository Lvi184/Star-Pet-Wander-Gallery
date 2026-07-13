import Phaser from 'phaser';

interface EnvironmentEvent {
  type: string;
  intensity: number;
  x?: number;
  y?: number;
  duration: number;
}

export class EnvironmentFXSystem {
  private scene: Phaser.Scene;
  private events: EnvironmentEvent[] = [];
  private particleEmitters: Map<string, Phaser.GameObjects.Particles.ParticleEmitter> = new Map();

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.createParticleTextures();
  }

  private createParticleTextures() {
    const textures = this.scene.textures;
    
    if (!textures.exists('qi_particle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(0, 255, 170, 1)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 170, 0.5)');
        gradient.addColorStop(1, 'rgba(0, 255, 170, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        textures.addImage('qi_particle', canvas);
      }
    }

    if (!textures.exists('shadow_particle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(34, 0, 68, 0.8)');
        gradient.addColorStop(0.5, 'rgba(34, 0, 68, 0.4)');
        gradient.addColorStop(1, 'rgba(34, 0, 68, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        textures.addImage('shadow_particle', canvas);
      }
    }

    if (!textures.exists('meteor_particle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 170, 0, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 100, 0, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 170, 0, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        textures.addImage('meteor_particle', canvas);
      }
    }

    if (!textures.exists('star_particle')) {
      const canvas = document.createElement('canvas');
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.5, 'rgba(255, 255, 200, 0.5)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 32, 32);
        textures.addImage('star_particle', canvas);
      }
    }
  }

  addEvent(event: EnvironmentEvent) {
    this.events.push(event);
    this.createParticleEffect(event);
  }

  removeEvent(type: string) {
    this.events = this.events.filter((e) => e.type !== type);
    this.destroyParticleEffect(type);
  }

  private createParticleEffect(event: EnvironmentEvent) {
    const centerX = event.x || this.scene.cameras.main.centerX;
    const centerY = event.y || this.scene.cameras.main.centerY;

    switch (event.type) {
      case 'qi_tide':
        this.createQiTideEffect(centerX, centerY, event.intensity);
        break;
      case 'shadow_storm':
        this.createShadowStormEffect(centerX, centerY);
        break;
      case 'meteor_shower':
        this.createMeteorShowerEffect(event.intensity);
        break;
      case 'star_fall':
        this.createStarFallEffect(centerX, centerY, event.intensity);
        break;
    }
  }

  private createQiTideEffect(x: number, y: number, intensity: number) {
    const emitter = this.scene.add.particles(0, 0, 'qi_particle', {
      x: x,
      y: y,
      speed: { min: 50, max: 150 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      tint: 0x00ffaa,
      blendMode: Phaser.BlendModes.ADD,
      frequency: 50 / intensity,
      lifespan: { min: 1000, max: 2000 },
    });
    this.particleEmitters.set('qi_tide', emitter);
  }

  private createShadowStormEffect(x: number, y: number) {
    const emitter = this.scene.add.particles(0, 0, 'shadow_particle', {
      x: { min: x - 200, max: x + 200 },
      y: y - 300,
      speedY: { min: 100, max: 300 },
      angle: { min: 80, max: 100 },
      scale: { start: 1, end: 0.5 },
      alpha: { start: 0.6, end: 0 },
      tint: 0x220044,
      blendMode: Phaser.BlendModes.MULTIPLY,
      frequency: 30,
      lifespan: 2000,
    });
    this.particleEmitters.set('shadow_storm', emitter);
  }

  private createMeteorShowerEffect(intensity: number) {
    const emitter = this.scene.add.particles(0, 0, 'meteor_particle', {
      x: { min: 0, max: this.scene.cameras.main.width },
      y: -50,
      speedY: { min: 200, max: 400 },
      angle: { min: 45, max: 135 },
      scale: { start: 0.8, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: 0xffaa00,
      blendMode: Phaser.BlendModes.ADD,
      frequency: 200 / intensity,
      lifespan: 1500,
      gravityY: 50,
    });
    this.particleEmitters.set('meteor_shower', emitter);
  }

  private createStarFallEffect(x: number, y: number, intensity: number) {
    const emitter = this.scene.add.particles(0, 0, 'star_particle', {
      x: { min: x - 300, max: x + 300 },
      y: { min: y - 300, max: y },
      speedY: { min: 20, max: 80 },
      scale: { start: 0.3, end: 0 },
      alpha: { start: 0.9, end: 0 },
      tint: 0xffffff,
      blendMode: Phaser.BlendModes.ADD,
      frequency: 100 / intensity,
      lifespan: 3000,
    });
    this.particleEmitters.set('star_fall', emitter);
  }

  private destroyParticleEffect(type: string) {
    const emitter = this.particleEmitters.get(type);
    if (emitter) {
      emitter.stop();
      emitter.destroy();
      this.particleEmitters.delete(type);
    }
  }

  update() {
    this.events = this.events.filter((e) => {
      e.duration -= 16;
      if (e.duration <= 0) {
        this.destroyParticleEffect(e.type);
        return false;
      }
      return true;
    });
  }

  destroy() {
    this.particleEmitters.forEach((emitter) => {
      emitter.stop();
      emitter.destroy();
    });
    this.particleEmitters.clear();
  }
}
import Phaser from 'phaser';

export class WebGLOptimizerPlugin extends Phaser.Plugins.ScenePlugin {
  private lightEnabled: boolean = false;
  private cameraShakeEnabled: boolean = false;
  private frameCount: number = 0;

  constructor(scene: Phaser.Scene, pluginManager: Phaser.Plugins.PluginManager, pluginKey: string) {
    super(scene, pluginManager, pluginKey);
    this.systems = scene.sys;
  }

  init() {
    if (this.systems) {
      this.systems.events.on('ready', this.onSceneReady, this);
      this.systems.events.on('shutdown', this.onSceneShutdown, this);
      this.systems.events.on('destroy', this.onSceneDestroy, this);
    }
  }

  private onSceneReady() {
    this.enableWebGLOptimizations();
  }

  private onSceneShutdown() {
    this.disableWebGLOptimizations();
  }

  private onSceneDestroy() {
    this.destroy();
  }

  private enableWebGLOptimizations() {
    const sys = this.systems;
    if (!sys) return;

    const game = sys.game;
    if (!game) return;

    if (game.config.renderType === Phaser.WEBGL) {
      this.lightEnabled = true;
      const lights = (this.scene as any).lights;
      if (lights) {
        lights.enable().setAmbientColor(0x444444);
      }
      const events = (this.scene as any).events;
      if (events) {
        events.on('update', this.onUpdate, this);
      }
    } else {
      console.warn('WebGL is not enabled, some optimizations will not work');
    }
  }

  private disableWebGLOptimizations() {
    const events = (this.scene as any).events;
    if (events) {
      events.off('update', this.onUpdate, this);
    }
  }

  private onUpdate() {
    this.frameCount++;

    if (this.frameCount % 60 === 0) {
      this.cleanupUnusedTextures();
    }
  }

  private cleanupUnusedTextures() {
    const textures = (this.scene as any).textures;
    if (!textures) return;
    
    const keys = textures.getTextureKeys();
    keys.forEach((key: string) => {
      const texture = textures.get(key);
      if (texture && !this.isTextureInUse(key)) {
        textures.removeKey(key);
      }
    });
  }

  private isTextureInUse(key: string): boolean {
    const sys = (this.scene as any).sys;
    if (!sys) return false;
    
    const displayList = sys.displayList;
    if (!displayList) return false;

    return displayList.getAll().some((obj: any) => {
      if (obj instanceof Phaser.GameObjects.Sprite || obj instanceof Phaser.GameObjects.Image) {
        return obj.texture.key === key;
      }
      return false;
    });
  }

  addToBatch(gameObject: Phaser.GameObjects.GameObject) {
    if (gameObject instanceof Phaser.GameObjects.Sprite && this.lightEnabled) {
      gameObject.setPipeline('Light2D');
    }
  }

  removeFromBatch(gameObject: Phaser.GameObjects.GameObject) {
    if (gameObject instanceof Phaser.GameObjects.Sprite) {
      gameObject.resetPipeline();
    }
  }

  addPointLight(x: number, y: number, radius: number, color: number = 0xffaa00, intensity: number = 1) {
    if (!this.lightEnabled) return null;
    const lights = (this.scene as any).lights;
    if (!lights) return null;
    return lights.addLight(x, y, radius, color, intensity);
  }

  enableCameraShake(enable: boolean) {
    this.cameraShakeEnabled = enable;
  }

  shakeCamera(intensity: number = 0.05, duration: number = 100) {
    if (!this.cameraShakeEnabled) return;
    const cameras = (this.scene as any).cameras;
    if (!cameras) return;
    const camera = cameras.main;
    if (camera) {
      camera.shake(duration, intensity);
    }
  }

  setAmbientColor(color: number) {
    const lights = (this.scene as any).lights;
    if (lights) {
      lights.setAmbientColor(color);
    }
  }

  destroy() {
    this.disableWebGLOptimizations();
    super.destroy();
  }
}
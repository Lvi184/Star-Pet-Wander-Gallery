import Phaser from 'phaser';

export enum Realm {
  QINGQIU = 'qingqiu',
  KUNLUN = 'kunlun',
  DONGHAI = 'donghai',
  YOUDU = 'youdu',
  LINGXU = 'lingxu',
  XINGHAI = 'xinghai',
}

interface Chunk {
  x: number;
  y: number;
  loaded: boolean;
  tilemap: Phaser.Tilemaps.Tilemap | null;
}

export class RealmChunkManager {
  private scene: Phaser.Scene;
  private currentRealm: Realm = Realm.QINGQIU;
  private chunks: Map<string, Chunk> = new Map();
  private chunkSize: number = 512;
  private viewDistance: number = 2;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  setRealm(realm: Realm) {
    this.currentRealm = realm;
    this.unloadAllChunks();
  }

  private getChunkKey(chunkX: number, chunkY: number): string {
    return `${this.currentRealm}_${chunkX}_${chunkY}`;
  }

  private worldToChunk(worldX: number, worldY: number): { chunkX: number; chunkY: number } {
    return {
      chunkX: Math.floor(worldX / this.chunkSize),
      chunkY: Math.floor(worldY / this.chunkSize),
    };
  }

  update(cameraX: number, cameraY: number) {
    const { chunkX: centerChunkX, chunkY: centerChunkY } = this.worldToChunk(cameraX, cameraY);

    for (let dx = -this.viewDistance; dx <= this.viewDistance; dx++) {
      for (let dy = -this.viewDistance; dy <= this.viewDistance; dy++) {
        const chunkX = centerChunkX + dx;
        const chunkY = centerChunkY + dy;
        const key = this.getChunkKey(chunkX, chunkY);

        if (!this.chunks.has(key)) {
          this.loadChunk(chunkX, chunkY);
        }
      }
    }

    this.unloadFarChunks(centerChunkX, centerChunkY);
  }

  private loadChunk(chunkX: number, chunkY: number) {
    const key = this.getChunkKey(chunkX, chunkY);
    
    const worldX = chunkX * this.chunkSize;
    const worldY = chunkY * this.chunkSize;

    let tilesetKey = 'village';
    let mapKey = 'sample_map';

    switch (this.currentRealm) {
      case Realm.QINGQIU:
        tilesetKey = 'forest_tileset';
        mapKey = 'qingqiu_map';
        break;
      case Realm.KUNLUN:
        tilesetKey = 'mountain_tileset';
        mapKey = 'kunlun_map';
        break;
      case Realm.DONGHAI:
        tilesetKey = 'water_tileset';
        mapKey = 'donghai_map';
        break;
      case Realm.YOUDU:
        tilesetKey = 'dark_tileset';
        mapKey = 'youdu_map';
        break;
      case Realm.LINGXU:
        tilesetKey = 'ruins_tileset';
        mapKey = 'lingxu_map';
        break;
      case Realm.XINGHAI:
        tilesetKey = 'star_tileset';
        mapKey = 'xinghai_map';
        break;
    }

    const chunk: Chunk = {
      x: chunkX,
      y: chunkY,
      loaded: true,
      tilemap: null,
    };

    try {
      const tilemap = this.scene.make.tilemap({
        key: mapKey,
      });

      if (tilemap) {
        tilemap.addTilesetImage(tilesetKey);
        const layer = tilemap.createLayer(0, tilesetKey, worldX, worldY);
        if (layer) {
          layer.setCollisionByProperty({ collides: true });
        }
        chunk.tilemap = tilemap;
      }
    } catch (e) {
      console.warn(`Failed to load chunk ${key}`);
    }

    this.chunks.set(key, chunk);
  }

  private unloadFarChunks(centerChunkX: number, centerChunkY: number) {
    const keysToRemove: string[] = [];

    this.chunks.forEach((chunk, key) => {
      const dx = Math.abs(chunk.x - centerChunkX);
      const dy = Math.abs(chunk.y - centerChunkY);

      if (dx > this.viewDistance + 1 || dy > this.viewDistance + 1) {
        if (chunk.tilemap) {
          chunk.tilemap.destroy();
        }
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => this.chunks.delete(key));
  }

  private unloadAllChunks() {
    this.chunks.forEach((chunk) => {
      if (chunk.tilemap) {
        chunk.tilemap.destroy();
      }
    });
    this.chunks.clear();
  }

  getChunkAtWorldPosition(worldX: number, worldY: number): Chunk | undefined {
    const { chunkX, chunkY } = this.worldToChunk(worldX, worldY);
    return this.chunks.get(this.getChunkKey(chunkX, chunkY));
  }

  destroy() {
    this.unloadAllChunks();
  }
}
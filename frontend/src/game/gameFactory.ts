import Phaser from 'phaser';
import { GAME_CONFIG } from './config';

interface GameFactoryOptions {
  parent: string;
  onRegionEnter?: (regionId: string) => void;
  onPlayerMove?: (x: number, y: number) => void;
}

export function createGame(options: GameFactoryOptions): Phaser.Game {
  const { parent } = options;

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: GAME_CONFIG.width,
    height: GAME_CONFIG.height,
    parent,
    backgroundColor: GAME_CONFIG.backgroundColor,
    zoom: GAME_CONFIG.zoom,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scene: [],
  };

  const game = new Phaser.Game(config);

  return game;
}

export function addScene(game: Phaser.Game, sceneClass: any): void {
  game.scene.add(sceneClass.name, sceneClass);
}

export function startScene(game: Phaser.Game, sceneName: string): void {
  game.scene.start(sceneName);
}
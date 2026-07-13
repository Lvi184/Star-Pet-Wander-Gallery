import { useLayoutEffect, useRef } from 'react';
import Phaser from 'phaser';
import GameScene from './scenes/GameScene';
import { mapAssetPaths, tilesetAssetPaths, atlasAssetPaths, imageAssetPaths } from './config';
import { REGIONS } from './constants';
import { WebGLOptimizerPlugin } from './systems/WebGLOptimizerPlugin';

interface GameEngineProps {
  currentLocation: string;
}

const GameEngine = ({ currentLocation }: GameEngineProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gameRef = useRef<Phaser.Game | null>(null);
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (initializedRef.current) {
      if (gameRef.current) {
        const scene = gameRef.current.scene.getScene('GameScene');
        if (scene) {
          scene.scene.restart({ location: currentLocation });
        }
      }
      return;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    const phaserGame = new Phaser.Game({
      type: Phaser.WEBGL,
      title: '星宠漫游馆',
      parent: containerRef.current,
      width: width,
      height: height,
      scene: [
        {
          key: 'BootScene',
          preload: function() {
            Object.entries(mapAssetPaths).forEach(([key, path]) => {
              this.load.tilemapTiledJSON(key, path);
            });

            Object.entries(tilesetAssetPaths).forEach(([key, path]) => {
              this.load.image(key, path);
            });

            Object.entries(atlasAssetPaths).forEach(([key, paths]) => {
              this.load.atlas(key, paths.image, paths.json);
            });

            Object.entries(imageAssetPaths).forEach(([key, path]) => {
              this.load.image(key, path);
            });

            this.load.bitmapFont(
              'press-start',
              '/assets/game/fonts/press-start-normal-white.png',
              '/assets/game/fonts/press-start-normal-white.xml'
            );

            this.load.image('qi_particle', '/assets/game/particles/qi_particle.png');
            this.load.image('shadow_particle', '/assets/game/particles/shadow_particle.png');
            this.load.image('meteor_particle', '/assets/game/particles/meteor_particle.png');
            this.load.image('star_particle', '/assets/game/particles/star_particle.png');
          },
          create: function() {
            const regionId = Object.keys(REGIONS).find(
              (key) => REGIONS[key as keyof typeof REGIONS] === currentLocation
            ) || 'QINGQIU';
            
            this.scene.start('GameScene', { location: REGIONS[regionId as keyof typeof REGIONS] });
          }
        },
        GameScene
      ],
      physics: {
        default: 'arcade',
        arcade: {
          debug: false,
          gravity: { x: 0, y: 0 },
        },
      },
      backgroundColor: '#2d5a27',
      plugins: {
        scene: [
          { key: 'webGLOptimizer', plugin: WebGLOptimizerPlugin, mapping: 'webGLOptimizer' }
        ]
      },
    });

    gameRef.current = phaserGame;
    initializedRef.current = true;

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
        initializedRef.current = false;
      }
    };
  }, [currentLocation]);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full relative"
      style={{ backgroundColor: '#2d5a27' }}
    />
  );
};

export default GameEngine;
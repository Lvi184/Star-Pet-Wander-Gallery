import { getFileNameWithoutExtension, isObject } from './utils';

import BootScene from '../scenes/BootScene';
import GameScene from '../scenes/GameScene';
import * as LoadAssetsSceneModule from '../scenes/LoadAssetsScene';
import * as MainMenuSceneModule from '../scenes/MainMenuScene';

export const calculateGameSize = (
  width: number,
  height: number,
  tileWidth: number,
  tileHeight: number,
  widthThreshold = 0.5,
  heightThreshold = 0.5
) => {
  const widthScale = Math.floor(window.innerWidth / width);
  const heightScale = Math.floor(window.innerHeight / height);
  const zoom = Math.min(widthScale, heightScale) || 1;

  const newWidth = Math.floor(window.innerWidth / tileWidth) * tileWidth / zoom;
  const newHeight = Math.floor(window.innerHeight / tileHeight) * tileHeight / zoom;

  return {
    zoom,
    width: Math.min(newWidth, Math.floor((width * (1 + widthThreshold)) / tileWidth) * tileWidth),
    height: Math.min(newHeight, Math.floor((height * (1 + heightThreshold)) / tileHeight) * tileHeight),
  };
};

export const asyncLoader = (loaderPlugin: any) =>
  new Promise((resolve, reject) => {
    loaderPlugin.on('filecomplete', resolve).on('loaderror', reject);
    loaderPlugin.start();
  });

export const prepareScene = (module: any, modulePath: string) => {
  if (Object.getOwnPropertyDescriptor(module.default || {}, 'prototype')) {
    return module.default;
  }

  function init(this: any, data: unknown) {
    if (isObject(module.scene)) {
      Object.entries(this).forEach(([key, value]) => {
        module.scene[key] = value;
      });
    }

    module.init?.(data);
  }

  const key = module.key || getFileNameWithoutExtension(modulePath);
  return {
    ...module,
    name: key,
    key,
    init,
  };
};

export const getScenesModules = () => {
  const sceneModules: any[] = [
    BootScene,
    GameScene,
    prepareScene(LoadAssetsSceneModule, 'LoadAssetsScene'),
    prepareScene(MainMenuSceneModule, 'MainMenuScene'),
  ];
  
  return sceneModules;
};
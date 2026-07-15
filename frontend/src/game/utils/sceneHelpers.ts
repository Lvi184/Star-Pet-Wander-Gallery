import { Input } from 'phaser';

import {
  KEY,
  COIN,
  DOOR,
  HEART,
  ENEMY,
  CRYSTAL,
  IDLE_FRAME,
  TILE_WIDTH,
  TILE_HEIGHT,
  UP_DIRECTION,
  LEFT_DIRECTION,
  DOWN_DIRECTION,
  RIGHT_DIRECTION,
  KEY_SPRITE_NAME,
  HERO_SPRITE_NAME,
  COIN_SPRITE_NAME,
  ENEMY_SPRITE_NAME,
  HEART_SPRITE_NAME,
  CRYSTAL_SPRITE_NAME,
  IDLE_FRAME_POSITION_KEY,
  GAME_SPEED,
  NPC_SPEED,
  ANIMATION_FRAME_RATE,
} from '../constants';

import {
  getSelectorData,
  getDegreeFromRadians,
  rotateRectangleInsideTile,
  createInteractiveGameObject,
} from './utils';

import { selectDialogMessages, selectDialogSetters } from '../zustand/dialog/selectDialog';
import { selectMapKey, selectTilesets, selectMapSetters } from '../zustand/map/selectMapData';
import {
  selectHeroSetters,
  selectHeroInitialFrame,
  selectHeroInitialPosition,
  selectHeroFacingDirection,
} from '../zustand/hero/selectHeroData';
import { selectTextSetters } from '../zustand/text/selectText';
import { selectGameSetters } from '../zustand/game/selectGameData';

export const createWalkingAnimation = (scene: any, assetKey: string, animationName: string, frameQuantity: number) => {
  scene.anims.create({
    key: `${assetKey}_${animationName}`,
    frames: Array.from({ length: frameQuantity }).map((_, index) => ({
      key: assetKey,
      frame: `${animationName}_${(index + 1).toString().padStart(2, '0')}`,
    })),
    frameRate: ANIMATION_FRAME_RATE,
    repeat: -1,
    yoyo: true,
  });
};

export const handleCreateControls = (scene: any) => {
  scene.actionKey = scene.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);
  scene.cursors = scene.input.keyboard.createCursorKeys();
  scene.wasd = scene.input.keyboard.addKeys({
    [UP_DIRECTION]: Input.Keyboard.KeyCodes.W,
    [DOWN_DIRECTION]: Input.Keyboard.KeyCodes.S,
    [LEFT_DIRECTION]: Input.Keyboard.KeyCodes.A,
    [RIGHT_DIRECTION]: Input.Keyboard.KeyCodes.D,
  });
};

export const handleCreateGroups = (scene: any) => {
  scene.sprites = scene.add.group();
  scene.enemies = scene.add.group();
  scene.items = scene.add.group();
  scene.mapLayers = scene.add.group();
  scene.npcs = scene.add.group();
  scene.portals = scene.add.group();
};

export const handleCreateMap = (scene: any) => {
  const mapKey = getSelectorData(selectMapKey);
  const tilesets = getSelectorData(selectTilesets);
  const customColliders = scene.add.group();

  const map = scene.make.tilemap({ key: mapKey });
  tilesets.forEach((tilesetName: string) => {
    map.addTilesetImage(tilesetName, tilesetName);
  });

  map.layers.forEach((layerData: any) => {
    const layer = map.createLayer(layerData.name, tilesets, 0, 0);

    layer.layer.data.forEach((tileRows: any) => {
      tileRows.forEach((tile: any) => {
        const { index, tileset, properties } = tile;
        const { collideLeft, collideRight, collideUp, collideDown } = properties;
        const tilesetCustomColliders = tileset?.getTileData?.(index);

        if (tilesetCustomColliders) {
          const { objectgroup } = tilesetCustomColliders;
          const { objects } = objectgroup;

          objects?.forEach((objectData: any) => {
            let { height, width, x, y } = objectData;

            if (height === TILE_HEIGHT && width === TILE_WIDTH) {
              tile.setCollision(
                Boolean(collideLeft),
                Boolean(collideRight),
                Boolean(collideUp),
                Boolean(collideDown)
              );
              return;
            }

            const { rotation, flipX, flipY } = tile;
            if (flipX) {
              x = TILE_WIDTH - (x + width);
            }
            if (flipY) {
              y = TILE_HEIGHT - (y + height);
            }

            const degree = getDegreeFromRadians(rotation);
            [x, y, width, height] = rotateRectangleInsideTile(x, y, width, height, degree);

            const customCollider = createInteractiveGameObject(
              scene,
              tile.x * TILE_WIDTH + x,
              tile.y * TILE_HEIGHT + y,
              width,
              height
            );

            customColliders.add(customCollider);
          });
        } else {
          tile.setCollision(
            Boolean(collideLeft),
            Boolean(collideRight),
            Boolean(collideUp),
            Boolean(collideDown)
          );
        }
      });
    });

    scene.mapLayers.add(layer);
  });

  scene.map = map;
  return customColliders;
};

export const handleCreateHero = (scene: any) => {
  const initialFrame = getSelectorData(selectHeroInitialFrame);
  const initialPosition = getSelectorData(selectHeroInitialPosition);
  const { x, y } = initialPosition;

  const heroSprite = scene.physics.add
    .sprite(x * TILE_WIDTH, y * TILE_HEIGHT, HERO_SPRITE_NAME, initialFrame)
    .setName(HERO_SPRITE_NAME)
    .setOrigin(0, 0)
    .setDepth(1);

  heroSprite.body.width = 10;
  heroSprite.body.height = 8;
  heroSprite.body.setOffset(3, 8);

  scene.physics.add.collider(heroSprite, scene.mapLayers);
  const actionColliderSizeOffset = 10;
  heroSprite.actionCollider = createInteractiveGameObject(
    scene,
    0,
    0,
    TILE_WIDTH - actionColliderSizeOffset,
    TILE_HEIGHT - actionColliderSizeOffset
  );

  const updateActionCollider = ({ top, right, bottom, left, width, height }: any = heroSprite.body) => {
    const facingDirection = getSelectorData(selectHeroFacingDirection);

    switch (facingDirection) {
      case DOWN_DIRECTION: {
        heroSprite.actionCollider.setX(left + actionColliderSizeOffset / 2 - (heroSprite.width - width) / 2);
        heroSprite.actionCollider.setY(bottom);
        break;
      }
      case UP_DIRECTION: {
        heroSprite.actionCollider.setX(left + actionColliderSizeOffset / 2 - (heroSprite.width - width) / 2);
        heroSprite.actionCollider.setY(top - height + actionColliderSizeOffset - (heroSprite.height - height));
        break;
      }
      case LEFT_DIRECTION: {
        heroSprite.actionCollider.setX(left - width + actionColliderSizeOffset - (heroSprite.width - width));
        heroSprite.actionCollider.setY(top + actionColliderSizeOffset / 2 - (heroSprite.height - height) / 2);
        break;
      }
      case RIGHT_DIRECTION: {
        heroSprite.actionCollider.setX(right);
        heroSprite.actionCollider.setY(top + actionColliderSizeOffset / 2 - (heroSprite.height - height) / 2);
        break;
      }
      default: {
        break;
      }
    }
  };

  updateActionCollider(heroSprite.getBounds());
  heroSprite.update = (time: number, delta: number) => {
    if (heroSprite.body.velocity.y === 0 && heroSprite.body.velocity.x === 0) {
      return;
    }
    updateActionCollider();
  };

  scene.heroSprite = heroSprite;
  scene.sprites.add(heroSprite);
};

export const handleObjectsLayer = (scene: any) => {
  scene.map.objects.forEach((objectLayerData: any) => {
    objectLayerData?.objects?.forEach((object: any) => {
      const { gid, properties, x, y, name, width, height } = object;
      const propertiesObject = Object.fromEntries(properties?.map((curr: any) => [curr.name, curr.value]) || []);

      switch (gid || name) {
        case ENEMY: {
          const spriteName = `${ENEMY_SPRITE_NAME}_${name}`;
          const enemy = scene.physics.add
            .sprite(x, y, ENEMY_SPRITE_NAME, IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, DOWN_DIRECTION))
            .setName(spriteName)
            .setOrigin(0, 1)
            .setDepth(1);

          enemy.body.setImmovable(true);
          scene.sprites.add(enemy);
          scene.enemies.add(enemy);

          

          const enemyActionHeroCollider = scene.physics.add.overlap(
            enemy,
            scene.heroSprite.actionCollider,
            () => {
              if (Input.Keyboard.JustDown(scene.actionKey)) {
                const { setDialogAction, setDialogMessages, setDialogCharacterName } = getSelectorData(selectDialogSetters);
                const dialogMessages = getSelectorData(selectDialogMessages);

                if (dialogMessages.length === 0) {
                  enemyActionHeroCollider.active = false;
                  setDialogCharacterName('怪物');
                  setDialogMessages([
                    '吼！你闯入了我的领地！',
                    '准备战斗吧！',
                  ]);
                  setDialogAction(() => {
                    Input.Keyboard.JustDown(scene.actionKey);
                    setDialogCharacterName('');
                    setDialogMessages([]);
                    setDialogAction(null);
                  });

                  scene.time.delayedCall(0, () => {
                    enemyActionHeroCollider.active = true;
                  });
                }
              }
            }
          );

          break;
        }
        case COIN: {
          const spriteName = `${COIN_SPRITE_NAME}_${name}`;
          const coin = scene.physics.add
            .sprite(x, y, COIN_SPRITE_NAME, 'coin_idle_01')
            .setOrigin(0, 1)
            .setName(spriteName)
            .setDepth(1);

          const animationKey = `${COIN_SPRITE_NAME}_idle`;
          if (!scene.anims.exists(animationKey)) {
            scene.anims.create({
              key: animationKey,
              frames: Array.from({ length: 2 }).map((_, index) => ({
                key: COIN_SPRITE_NAME,
                frame: `${COIN_SPRITE_NAME}_idle_${(index + 1).toString().padStart(2, '0')}`,
              })),
              frameRate: 3,
              repeat: -1,
              yoyo: false,
            });
          }

          coin.anims.play(animationKey);
          scene.items.add(coin);

          scene.physics.add.overlap(scene.heroSprite, coin, () => {
            coin.destroy();
          });

          break;
        }
        case HEART: {
          const spriteName = `${HEART_SPRITE_NAME}_${name}`;
          const heart = scene.physics.add
            .image(x, y, HEART_SPRITE_NAME)
            .setOrigin(0, 1)
            .setName(spriteName)
            .setDepth(1);

          scene.items.add(heart);

          scene.physics.add.overlap(scene.heroSprite, heart, () => {
            heart.destroy();
          });

          break;
        }
        case CRYSTAL: {
          const spriteName = `${CRYSTAL_SPRITE_NAME}_${name}`;
          const crystal = scene.physics.add
            .image(x, y, CRYSTAL_SPRITE_NAME)
            .setOrigin(0, 1)
            .setName(spriteName)
            .setDepth(1);

          scene.items.add(crystal);

          scene.physics.add.overlap(scene.heroSprite, crystal, () => {
            crystal.destroy();
          });

          break;
        }
        case KEY: {
          const spriteName = `${KEY_SPRITE_NAME}_${name}`;
          const key = scene.physics.add
            .image(x, y, KEY_SPRITE_NAME)
            .setOrigin(0, 1)
            .setName(spriteName)
            .setDepth(1);

          scene.items.add(key);

          scene.physics.add.overlap(scene.heroSprite, key, () => {
            key.destroy();
          });

          break;
        }
        case DOOR: {
          const { type, map, position } = propertiesObject;
          const customCollider = createInteractiveGameObject(scene, x, y, TILE_WIDTH, TILE_HEIGHT, {
            x: 0,
            y: 1,
          });

          const overlapCollider = scene.physics.add.overlap(scene.heroSprite, customCollider, () => {
            scene.physics.world.removeCollider(overlapCollider);
            const [posX, posY] = position.split(';');
            const {
              setHeroInitialFrame,
              setHeroFacingDirection,
              setHeroInitialPosition,
              setHeroPreviousPosition,
            } = getSelectorData(selectHeroSetters);
            const { setMapKey } = getSelectorData(selectMapSetters);
            const facingDirection = getSelectorData(selectHeroFacingDirection);

            setMapKey(map);
            setHeroFacingDirection(facingDirection);
            setHeroInitialFrame(IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, facingDirection));
            setHeroInitialPosition({ x: posX, y: posY });
            setHeroPreviousPosition({ x: posX, y: posY });

            changeScene(scene, 'GameScene', {
              atlases: ['hero'],
              images: [],
              mapKey: map,
            });
          });

          break;
        }
        default: {
          break;
        }
      }
    });
  });
};

export const handleConfigureCamera = (scene: any) => {
  const { game } = scene.sys;
  const camera = scene.cameras.main;
  const mapWidth = scene.map.widthInPixels;
  const mapHeight = scene.map.heightInPixels;
  const screenWidth = game.scale.gameSize.width;
  const screenHeight = game.scale.gameSize.height;

  camera.setBounds(0, 0, mapWidth, mapHeight);
  camera.setZoom(1);
  camera.centerOn(mapWidth / 2, mapHeight / 2);

  const minZoom = 0.5;
  const maxZoom = 3;

  const initialZoom = Math.max(screenWidth / mapWidth, screenHeight / mapHeight);
  camera.setZoom(Math.max(minZoom, initialZoom));

  let isDragging = false;
  let wasDragging = false;
  let startPointerX = 0;
  let startPointerY = 0;
  let dragStartScrollX = 0;
  let dragStartScrollY = 0;

  scene.input.on('pointerdown', (pointer: any) => {
    isDragging = true;
    wasDragging = false;
    startPointerX = pointer.x;
    startPointerY = pointer.y;
    dragStartScrollX = camera.scrollX;
    dragStartScrollY = camera.scrollY;
  });

  scene.input.on('pointermove', (pointer: any) => {
    if (!isDragging) return;

    const deltaX = pointer.x - startPointerX;
    const deltaY = pointer.y - startPointerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    if (distance > 5) {
      wasDragging = true;
    }

    const zoom = camera.zoom;
    camera.scrollX = dragStartScrollX - deltaX / zoom;
    camera.scrollY = dragStartScrollY - deltaY / zoom;
  });

  scene.input.on('pointerup', () => {
    isDragging = false;
  });

  scene.input.on('pointerout', () => {
    isDragging = false;
  });

  scene.isDragging = () => isDragging;
  scene.wasDragging = () => wasDragging;

  scene.input.on('wheel', (pointer: any, _gameObjects: any, _deltaX: number, deltaY: number, _deltaZ: number) => {
    const zoom = camera.zoom;
    const newZoom = Math.max(minZoom, Math.min(maxZoom, zoom - deltaY * 0.001));
    
    const worldX = camera.getWorldPoint(pointer.x, pointer.y).x;
    const worldY = camera.getWorldPoint(pointer.x, pointer.y).y;
    
    camera.setZoom(newZoom);
    
    camera.scrollX = worldX - pointer.x / newZoom;
    camera.scrollY = worldY - pointer.y / newZoom;
  });

  scene.cameraBounds = { minZoom, maxZoom };
};

export const handleCreateHeroAnimations = (scene: any) => {
  [UP_DIRECTION, DOWN_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION].forEach((direction) => {
    createWalkingAnimation(scene, HERO_SPRITE_NAME, `walk_${direction}`, 3);
  });
};

export const handleCreateNPCAnimations = (scene: any, spriteKey: string) => {
  [UP_DIRECTION, DOWN_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION].forEach((direction) => {
    createWalkingAnimation(scene, spriteKey, `walk_${direction}`, 3);
  });
};

export const handleHeroMovement = (scene: any, heroSpeed: number = GAME_SPEED) => {
  const dialogMessages = getSelectorData(selectDialogMessages);
  if (dialogMessages.length > 0) {
    return;
  }

  const { setHeroFacingDirection } = getSelectorData(selectHeroSetters);

  if (scene.cursors.left.isDown || scene.wasd[LEFT_DIRECTION].isDown) {
    scene.heroSprite.body.setVelocityY(0);
    scene.heroSprite.body.setVelocityX(-heroSpeed);
    scene.heroSprite.anims.play(`${HERO_SPRITE_NAME}_walk_${LEFT_DIRECTION}`, true);
    setHeroFacingDirection(LEFT_DIRECTION);
  } else if (scene.cursors.right.isDown || scene.wasd[RIGHT_DIRECTION].isDown) {
    scene.heroSprite.body.setVelocityY(0);
    scene.heroSprite.body.setVelocityX(heroSpeed);
    scene.heroSprite.anims.play(`${HERO_SPRITE_NAME}_walk_${RIGHT_DIRECTION}`, true);
    setHeroFacingDirection(RIGHT_DIRECTION);
  } else if (scene.cursors.up.isDown || scene.wasd[UP_DIRECTION].isDown) {
    scene.heroSprite.body.setVelocityX(0);
    scene.heroSprite.body.setVelocityY(-heroSpeed);
    scene.heroSprite.anims.play(`${HERO_SPRITE_NAME}_walk_${UP_DIRECTION}`, true);
    setHeroFacingDirection(UP_DIRECTION);
  } else if (scene.cursors.down.isDown || scene.wasd[DOWN_DIRECTION].isDown) {
    scene.heroSprite.body.setVelocityX(0);
    scene.heroSprite.body.setVelocityY(heroSpeed);
    scene.heroSprite.anims.play(`${HERO_SPRITE_NAME}_walk_${DOWN_DIRECTION}`, true);
    setHeroFacingDirection(DOWN_DIRECTION);
  } else {
    const facingDirection = getSelectorData(selectHeroFacingDirection);
    scene.heroSprite.body.setVelocityX(0);
    scene.heroSprite.body.setVelocityY(0);
    scene.heroSprite.anims.stop();
    scene.heroSprite.setFrame(
      IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, facingDirection)
    );
  }
};

export const handleNPCMovement = (scene: any, npc: any) => {
  if (!npc.behavior || npc.behavior === 'stand') return;

  const { x, y } = npc.body.position;
  const speed = NPC_SPEED;

  if (npc.behavior === 'wander') {
    if (!npc.wanderTimer || npc.wanderTimer <= 0) {
      npc.wanderTimer = Phaser.Math.Between(60, 180);
      npc.wanderDirection = [UP_DIRECTION, DOWN_DIRECTION, LEFT_DIRECTION, RIGHT_DIRECTION][
        Phaser.Math.Between(0, 3)
      ];
    }

    npc.wanderTimer -= 1;

    switch (npc.wanderDirection) {
      case UP_DIRECTION:
        npc.body.setVelocityY(-speed);
        npc.body.setVelocityX(0);
        npc.anims.play(`${npc.spriteKey}_walk_up`, true);
        break;
      case DOWN_DIRECTION:
        npc.body.setVelocityY(speed);
        npc.body.setVelocityX(0);
        npc.anims.play(`${npc.spriteKey}_walk_down`, true);
        break;
      case LEFT_DIRECTION:
        npc.body.setVelocityX(-speed);
        npc.body.setVelocityY(0);
        npc.anims.play(`${npc.spriteKey}_walk_left`, true);
        break;
      case RIGHT_DIRECTION:
        npc.body.setVelocityX(speed);
        npc.body.setVelocityY(0);
        npc.anims.play(`${npc.spriteKey}_walk_right`, true);
        break;
    }
  } else if (npc.behavior === 'patrol') {
    if (!npc.patrolPoints || npc.patrolPoints.length === 0) {
      npc.patrolPoints = [
        { x: x - 32, y },
        { x: x + 32, y },
      ];
      npc.currentPatrolIndex = 0;
    }

    const target = npc.patrolPoints[npc.currentPatrolIndex];
    const distance = Phaser.Math.Distance.Between(x, y, target.x, target.y);

    if (distance < 10) {
      npc.currentPatrolIndex = (npc.currentPatrolIndex + 1) % npc.patrolPoints.length;
    } else {
      const angle = Phaser.Math.Angle.Between(x, y, target.x, target.y);
      npc.body.setVelocityX(Math.cos(angle) * speed);
      npc.body.setVelocityY(Math.sin(angle) * speed);

      if (Math.abs(npc.body.velocity.x) > Math.abs(npc.body.velocity.y)) {
        npc.anims.play(`${npc.spriteKey}_walk_${npc.body.velocity.x > 0 ? 'right' : 'left'}`, true);
      } else {
        npc.anims.play(`${npc.spriteKey}_walk_${npc.body.velocity.y > 0 ? 'down' : 'up'}`, true);
      }
    }
  }
};

export const createNPC = (scene: any, npcData: any) => {
  const { id, name, spriteKey, position, direction, dialog, behavior } = npcData;

  const npc = scene.physics.add
    .sprite(position.x * TILE_WIDTH, position.y * TILE_HEIGHT, spriteKey)
    .setName(id)
    .setOrigin(0, 0)
    .setDepth(1);

  npc.body.width = 10;
  npc.body.height = 8;
  npc.body.setOffset(3, 8);

  npc.name = name;
  npc.dialog = dialog;
  npc.behavior = behavior;
  npc.spriteKey = spriteKey;

  scene.physics.add.collider(npc, scene.mapLayers);
  scene.sprites.add(npc);
  scene.npcs.add(npc);

  handleCreateNPCAnimations(scene, spriteKey);

  const npcActionHeroCollider = scene.physics.add.overlap(
    npc,
    scene.heroSprite.actionCollider,
    () => {
      if (Input.Keyboard.JustDown(scene.actionKey)) {
        const { setDialogAction, setDialogMessages, setDialogCharacterName } = getSelectorData(selectDialogSetters);
        const dialogMessages = getSelectorData(selectDialogMessages);

        if (dialogMessages.length === 0) {
          npcActionHeroCollider.active = false;
          setDialogCharacterName(name);
          setDialogMessages(dialog);
          setDialogAction(() => {
            Input.Keyboard.JustDown(scene.actionKey);
            setDialogCharacterName('');
            setDialogMessages([]);
            setDialogAction(null);
          });

          scene.time.delayedCall(0, () => {
            npcActionHeroCollider.active = true;
          });
        }
      }
    }
  );

  return npc;
};

export const createPortal = (scene: any, x: number, y: number, targetRegion: string) => {
  const portal = scene.physics.add
    .image(x * TILE_WIDTH + TILE_WIDTH / 2, y * TILE_HEIGHT + TILE_HEIGHT / 2, CRYSTAL_SPRITE_NAME)
    .setOrigin(0.5, 0.5)
    .setDepth(2);

  portal.setScale(1.5);
  portal.targetRegion = targetRegion;

  scene.portals.add(portal);

  scene.physics.add.overlap(scene.heroSprite, portal, () => {
    const {
      setHeroInitialFrame,
      setHeroFacingDirection,
      setHeroInitialPosition,
    } = getSelectorData(selectHeroSetters);
    const { setMapKey } = getSelectorData(selectMapSetters);

    setMapKey(`${targetRegion}Map`);
    setHeroFacingDirection(DOWN_DIRECTION);
    setHeroInitialFrame(IDLE_FRAME.replace(IDLE_FRAME_POSITION_KEY, DOWN_DIRECTION));
    setHeroInitialPosition({ x: 10, y: 10 });

    changeScene(scene, 'GameScene', {
      atlases: ['hero'],
      images: [],
      mapKey: `${targetRegion}Map`,
    });
  });

  return portal;
};

export const changeScene = (scene: any, nextScene: string, assets: any = {}, config: any = {}) => {
  scene.scene.start('LoadAssetsScene', {
    nextScene,
    assets,
  });
};

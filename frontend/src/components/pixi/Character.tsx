import { BaseTexture, ISpritesheetData, Spritesheet, Texture } from 'pixi.js';
import { useState, useEffect, useRef, useCallback } from 'react';
import { AnimatedSprite, Container, Graphics, Sprite, Text } from '@pixi/react';
import * as PIXI from 'pixi.js';

export type CharacterState = 'idle' | 'happy' | 'scared' | 'sleep';

export const Character = ({
  textureUrl,
  spritesheetData,
  walkTextureUrl,
  walkSpritesheetData,
  stateTextureUrl,
  stateSpritesheetData,
  x,
  y,
  orientation,
  isMoving = false,
  isThinking = false,
  isSpeaking = false,
  emoji = '',
  isViewer = false,
  speed = 0.1,
  onClick,
  isStaticImage = false,
  characterState = 'idle',
}: {
  textureUrl?: string;
  spritesheetData?: ISpritesheetData;
  walkTextureUrl?: string;
  walkSpritesheetData?: ISpritesheetData;
  stateTextureUrl?: string;
  stateSpritesheetData?: ISpritesheetData;
  x: number;
  y: number;
  orientation: number;
  isMoving?: boolean;
  isThinking?: boolean;
  isSpeaking?: boolean;
  emoji?: string;
  isViewer?: boolean;
  speed?: number;
  onClick: () => void;
  isStaticImage?: boolean;
  characterState?: CharacterState;
}) => {
  const [walkSpriteSheet, setWalkSpriteSheet] = useState<Spritesheet>();
  const [stateSpriteSheet, setStateSpriteSheet] = useState<Spritesheet>();
  const [staticTexture, setStaticTexture] = useState<Texture>();

  useEffect(() => {
    if (isStaticImage && textureUrl) {
      const tex = Texture.from(textureUrl);
      setStaticTexture(tex);
      return () => {
        tex.destroy();
      };
    }
  }, [isStaticImage, textureUrl]);

  useEffect(() => {
    const primaryUrl = walkTextureUrl || textureUrl;
    const primaryData = walkSpritesheetData || spritesheetData;
    
    if (primaryUrl && primaryData && !isStaticImage) {
      const parseSheet = async () => {
        try {
          const baseTexture = BaseTexture.from(primaryUrl, {
            scaleMode: PIXI.SCALE_MODES.NEAREST,
          });
          const sheet = new Spritesheet(baseTexture, primaryData!);
          await sheet.parse();
          setWalkSpriteSheet(sheet);
        } catch (e) {
          console.error('Failed to load sprite sheet:', primaryUrl, e);
        }
      };
      void parseSheet();
    }
  }, [walkTextureUrl, walkSpritesheetData, textureUrl, spritesheetData, isStaticImage]);

  useEffect(() => {
    if (stateTextureUrl && stateSpritesheetData) {
      const parseSheet = async () => {
        const sheet = new Spritesheet(
          BaseTexture.from(stateTextureUrl, {
            scaleMode: PIXI.SCALE_MODES.NEAREST,
          }),
          stateSpritesheetData!,
        );
        await sheet.parse();
        setStateSpriteSheet(sheet);
      };
      void parseSheet();
    }
  }, [stateTextureUrl, stateSpritesheetData]);

  const roundedOrientation = Math.floor(orientation / 90);
  const direction = ['right', 'down', 'left', 'up'][roundedOrientation];



  const walkRef = useRef<PIXI.AnimatedSprite | null>(null);
  const stateRef = useRef<PIXI.AnimatedSprite | null>(null);

  useEffect(() => {
    if (isMoving && walkRef.current) {
      walkRef.current.play();
    } else if (walkRef.current) {
      walkRef.current.stop();
      walkRef.current.gotoAndStop(0);
    }
  }, [direction, isMoving]);

  useEffect(() => {
    if (!isMoving && stateRef.current) {
      stateRef.current.play();
    } else if (stateRef.current) {
      stateRef.current.stop();
      stateRef.current.gotoAndStop(0);
    }
  }, [characterState, isMoving]);

  const hasDualSpritesheets = walkSpriteSheet && stateSpriteSheet;

  if (!walkSpriteSheet && !isStaticImage) {
    return (
      <Container x={x} y={y} interactive={true} pointerdown={onClick} cursor="pointer">
        <Graphics draw={(g) => {
          g.clear();
          g.beginFill(0xff6b9d);
          g.drawCircle(0, 0, 12);
          g.endFill();
        }} />
      </Container>
    );
  }
  if (!staticTexture && isStaticImage) {
    return (
      <Container x={x} y={y} interactive={true} pointerdown={onClick} cursor="pointer">
        <Graphics draw={(g) => {
          g.clear();
          g.beginFill(0x8b5cf6);
          g.drawCircle(0, 0, 12);
          g.endFill();
        }} />
      </Container>
    );
  }

  if (walkSpriteSheet && !walkSpriteSheet.animations[direction]) {
    console.error('Animation not found for direction:', direction, 'available:', Object.keys(walkSpriteSheet.animations));
  }

  return (
    <Container x={x} y={y} interactive={true} pointerdown={onClick} cursor="pointer">
      {isThinking && (
        <Text x={-20} y={-10} scale={{ x: -0.8, y: 0.8 }} text={'💭'} anchor={{ x: 0.5, y: 0.5 }} />
      )}
      {isSpeaking && (
        <Text x={18} y={-10} scale={0.8} text={'💬'} anchor={{ x: 0.5, y: 0.5 }} />
      )}
      {isViewer && <ViewerIndicator />}
      {isStaticImage ? (
        <Sprite
          texture={staticTexture!}
          anchor={{ x: 0.5, y: 0.5 }}
          scale={{ x: 1.5, y: 1.5 }}
        />
      ) : walkSpriteSheet ? (
        <>
          <AnimatedSprite
            ref={walkRef}
            visible={!stateSpriteSheet || isMoving}
            isPlaying={isMoving}
            textures={walkSpriteSheet!.animations[direction] || walkSpriteSheet!.animations.down}
            animationSpeed={speed}
            anchor={{ x: 0.5, y: 0.5 }}
            scale={{ x: 2, y: 2 }}
          />
          {stateSpriteSheet && (
            <AnimatedSprite
              ref={stateRef}
              visible={!isMoving}
              isPlaying={!isMoving}
              textures={stateSpriteSheet.animations[characterState] || stateSpriteSheet.animations.idle}
              animationSpeed={speed * 0.5}
              anchor={{ x: 0.5, y: 0.5 }}
              scale={{ x: 1, y: 1 }}
            />
          )}
        </>
      ) : null}
      {emoji && (
        <Text x={0} y={-24} scale={{ x: -0.8, y: 0.8 }} text={emoji} anchor={{ x: 0.5, y: 0.5 }} />
      )}
    </Container>
  );
};

function ViewerIndicator() {
  const draw = useCallback((g: PIXI.Graphics) => {
    g.clear();
    g.beginFill(0xffff0b, 0.5);
    g.drawRoundedRect(-10, 10, 20, 10, 100);
    g.endFill();
  }, []);

  return <Graphics draw={draw} />;
}
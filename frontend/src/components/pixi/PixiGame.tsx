import * as PIXI from 'pixi.js';
import { useApp } from '@pixi/react';
import { useEffect, useRef, useCallback } from 'react';
import { PixiStaticMap } from './PixiStaticMap';
import PixiViewport from './PixiViewport';
import { Viewport } from 'pixi-viewport';
import { Character } from './Character';
import { characters } from './characters';
import { useGameStore } from '../../game/engine/gameStore';
import { tickPathfinding, tickPosition } from '../../game/engine/movement';
import { tickConversation } from '../../game/engine/conversation';
import { tickAgent } from '../../game/engine/agentBrain';
import { orientationDegrees } from '../../game/engine/geometry';
import { Player, Conversation } from '../../game/engine/types';

interface PixiGameProps {
  width?: number;
  height?: number;
}

export const PixiGame = (props: PixiGameProps) => {
  const pixiApp = useApp();
  const viewportRef = useRef<Viewport | undefined>();

  const worldMap = useGameStore((state) => state.worldMap);
  const humanPlayer = useGameStore((state) => state.getHumanPlayer());
  const movePlayer = useGameStore((state) => state.movePlayer);
  const updatePlayer = useGameStore((state) => state.updatePlayer);
  const updateConversation = useGameStore((state) => state.updateConversation);
  const setSelectedPlayerId = useGameStore((state) => state.setSelectedPlayerId);

  const playersRef = useRef<Map<string, Player>>(new Map());
  const conversationsRef = useRef<Map<string, Conversation>>(new Map());

  useEffect(() => {
    playersRef.current = new Map(useGameStore.getState().players);
  }, [useGameStore.getState().players]);

  useEffect(() => {
    conversationsRef.current = new Map(useGameStore.getState().conversations);
  }, [useGameStore.getState().conversations]);

  const { width, height, tileDim } = worldMap;

  const dragStart = useRef<{ screenX: number; screenY: number } | null>(null);
  const isDragging = useRef(false);
  const trackPlayer = useRef(true);

  const onMapPointerDown = useCallback((e: any) => {
    dragStart.current = { screenX: e.screenX, screenY: e.screenY };
    isDragging.current = false;
  }, []);

  const onMapPointerMove = useCallback((e: any) => {
    if (dragStart.current) {
      const { screenX, screenY } = dragStart.current;
      const [dx, dy] = [screenX - e.screenX, screenY - e.screenY];
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 10) {
        isDragging.current = true;
        trackPlayer.current = false;
      }
    }
  }, []);

  const onMapPointerUp = useCallback((e: any) => {
    const wasDragging = isDragging.current;
    dragStart.current = null;
    isDragging.current = false;

    if (wasDragging) {
      return;
    }

    const viewport = viewportRef.current;
    if (!viewport) return;

    const humanPlayer = useGameStore.getState().getHumanPlayer();
    if (!humanPlayer) return;

    const gameSpacePx = viewport.toWorld(e.screenX, e.screenY);
    const gameSpaceTiles = {
      x: gameSpacePx.x / tileDim,
      y: gameSpacePx.y / tileDim,
    };

    const roundedTiles = {
      x: Math.floor(gameSpaceTiles.x),
      y: Math.floor(gameSpaceTiles.y),
    };

    trackPlayer.current = true;
    movePlayer(humanPlayer.id, roundedTiles);
  }, [tileDim, movePlayer]);

  useEffect(() => {
    let animationFrameId: number;

    const gameLoop = () => {
      const now = Date.now();
      const gameStoreState = useGameStore.getState();
      const players = gameStoreState.players;
      const conversations = gameStoreState.conversations;

      const gameState = {
        conversations,
        worldMap,
        players,
      };

      players.forEach((player) => {
        let updatedPlayer: Player = { ...player };
        
        updatedPlayer = tickPathfinding(gameState, now, updatedPlayer);
        updatedPlayer = tickPosition(gameState, now, updatedPlayer);

        updatePlayer(player.id, {
          position: { ...updatedPlayer.position },
          facing: { ...updatedPlayer.facing },
          speed: updatedPlayer.speed,
          pathfinding: updatedPlayer.pathfinding,
        });
      });

      const currentPlayers = [...players.values()];
      currentPlayers.forEach((player) => {
        if (!player.human) {
          const otherPlayers = currentPlayers.filter((p) => p.id !== player.id);
          const action = tickAgent(player, worldMap, otherPlayers, now);
          if (action) {
            if (action.destination) {
              movePlayer(player.id, action.destination);
            } else if (action.activity) {
              updatePlayer(player.id, { activity: action.activity });
            }
          }
        }
      });

      conversations.forEach((conversation) => {
        const result = tickConversation(gameState, conversation, now);
        updateConversation(conversation.id, {
          participants: result.conversation.participants,
          isTyping: result.conversation.isTyping,
        });
        
        result.updatedPlayers.forEach((updatedPlayer, playerId) => {
          updatePlayer(playerId, {
            position: { ...updatedPlayer.position },
            facing: { ...updatedPlayer.facing },
            speed: updatedPlayer.speed,
            pathfinding: updatedPlayer.pathfinding,
          });
        });
      });

      const currentHumanPlayer = gameStoreState.getHumanPlayer();
      if (currentHumanPlayer && (currentHumanPlayer.pathfinding || currentHumanPlayer.speed > 0)) {
        trackPlayer.current = true;
      }

      if (viewportRef.current && currentHumanPlayer && trackPlayer.current) {
        const viewport = viewportRef.current;
        const targetX = currentHumanPlayer.position.x * tileDim;
        const targetY = currentHumanPlayer.position.y * tileDim;
        viewport.moveCenter(targetX, targetY);
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [worldMap, updatePlayer, updateConversation]);

  const getCharacterData = (characterName: string) => {
    return characters.find((c) => c.name === characterName) || characters[0];
  };

  const getPlayerDescription = (playerId: string) => {
    return useGameStore.getState().playerDescriptions.get(playerId);
  };

  const currentPlayers = useGameStore((state) => [...state.players.values()]);
  const currentConversations = useGameStore((state) => state.conversations);

  return (
    <PixiViewport
      app={pixiApp!}
      screenWidth={props.width || 800}
      screenHeight={props.height || 600}
      worldWidth={width * tileDim}
      worldHeight={height * tileDim}
      viewportRef={viewportRef}
    >
      <PixiStaticMap
        map={worldMap}
        onpointerup={onMapPointerUp}
        onpointerdown={onMapPointerDown}
        onpointermove={onMapPointerMove}
      />
      {currentPlayers.map((p) => {
        const description = getPlayerDescription(p.id);
        const character = getCharacterData(description?.character || 'f1');
        const conversationWithTyping = [...currentConversations.values()].find((c) => c.isTyping?.playerId === p.id);
        const isSpeaking = !!conversationWithTyping?.id;
        
        const getCharacterState = () => {
          if (p.activity?.description?.toLowerCase().includes('sleep')) return 'sleep';
          if (p.activity?.description?.toLowerCase().includes('happy') || p.activity?.description?.toLowerCase().includes('joy')) return 'happy';
          if (p.activity?.description?.toLowerCase().includes('scared') || p.activity?.description?.toLowerCase().includes('fear')) return 'scared';
          return 'idle';
        };
        
        return (
          <Character
            key={`player-${p.id}`}
            x={p.position.x * tileDim + tileDim / 2}
            y={p.position.y * tileDim + tileDim / 2}
            orientation={orientationDegrees(p.facing)}
            isMoving={p.speed > 0}
            isThinking={!isSpeaking && !p.pathfinding}
            isSpeaking={isSpeaking}
            emoji={p.activity?.emoji}
            isViewer={p.id === humanPlayer?.id}
            textureUrl={character.textureUrl}
            spritesheetData={character.spritesheetData}
            walkTextureUrl={character.walkTextureUrl}
            walkSpritesheetData={character.walkSpritesheetData}
            stateTextureUrl={character.stateTextureUrl}
            stateSpritesheetData={character.stateSpritesheetData}
            speed={character.speed}
            isStaticImage={character.isStaticImage || false}
            characterState={getCharacterState()}
            onClick={() => {
              setSelectedPlayerId(p.id);
            }}
          />
        );
      })}
    </PixiViewport>
  );
};

export default PixiGame;
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { PixiGame } from '../../components/pixi/PixiGame';
import { Stage } from '@pixi/react';
import PetListPanel from '../../components/PetListPanel/PetListPanel';
import WorldEventBanner from '../../components/WorldEventBanner/WorldEventBanner';
import RightPanel from '../../components/RightPanel/RightPanel';
import Drawer from '../../components/Drawer/Drawer';
import RewindPanel from '../../components/RewindPanel/RewindPanel';
import WorldlineDrawer from '../../components/WorldlineDrawer/WorldlineDrawer';
import TodoDrawer from '../../components/TodoDrawer/TodoDrawer';
import PlayerDetails from '../../components/pixi/PlayerDetails';
import { usePetStore } from '../../stores/petStore';
import { useGameStore } from '../../game/engine/gameStore';
import { eventBus, GAME_EVENTS } from '../../game/eventBus';

const ERA_NAME = '山海灵境 · 第一纪元';

interface Pet {
  id: string;
  name: string;
  species: string;
  health: number;
  energy: number;
  mood: number | string;
  spiritual_power: number;
  status: string;
  controller_type: string;
  current_region: string | null;
  cultivation_level?: number;
}

export default function MainLayout() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [_narrowScreen, _setNarrowScreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState<string | null>(null);
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const scrollViewRef = useRef<HTMLDivElement>(null);
  const [gameWidth, setGameWidth] = useState(800);
  const [gameHeight, setGameHeight] = useState(600);

  useEffect(() => {
    const updateSize = () => {
      if (gameContainerRef.current) {
        const rect = gameContainerRef.current.getBoundingClientRect();
        setGameWidth(rect.width);
        setGameHeight(rect.height);
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [leftCollapsed, rightCollapsed]);

  const { pets, selectedId, fetchPets, connectWebSocket, disconnectWebSocket, wsConnected } = usePetStore();
  const selectedPet = pets.find((p: Pet) => p.id === selectedId) || null;

  useEffect(() => {
    fetchPets();
    connectWebSocket();

    const handleControlChange = (event: { petId: string; controllerType: string }) => {
      const gameStore = useGameStore.getState();
      const player = gameStore.players.get(event.petId);
      if (player) {
        gameStore.updatePlayer(event.petId, {
          human: event.controllerType === 'player' ? 'human-1' : undefined,
        });
      }
    };

    eventBus.on(GAME_EVENTS.CONTROL_CHANGE, handleControlChange);

    return () => {
      disconnectWebSocket();
      eventBus.off(GAME_EVENTS.CONTROL_CHANGE, handleControlChange);
    };
  }, []);

  useEffect(() => {
    const syncPetsToGame = () => {
      const gameStore = useGameStore.getState();
      const existingPlayerIds = new Set(gameStore.players.keys());
      const currentPetIds = new Set(pets.map((p) => p.id));

      pets.forEach((pet: Pet) => {
        const isHuman = pet.controller_type === 'player';
        const characterKey = pet.id === 'char_2d2ca06b' ? 'hagimi' : 'f1';
        const existingPlayer = gameStore.players.get(pet.id);

        if (existingPlayer) {
          gameStore.updatePlayer(pet.id, {
            human: isHuman ? 'human-1' : undefined,
          });
          gameStore.playerDescriptions.set(pet.id, {
            playerId: pet.id,
            character: characterKey,
            description: `${pet.name} - ${pet.species}`,
            name: pet.name,
          });
        } else {
          gameStore.addPlayer(
            {
              id: pet.id,
              human: isHuman ? 'human-1' : undefined,
              lastInput: Date.now(),
              position: { x: pet.x || 10, y: pet.y || 10 },
              facing: { dx: 0, dy: 1 },
              speed: 0,
            },
            {
              playerId: pet.id,
              character: characterKey,
              description: `${pet.name} - ${pet.species}`,
              name: pet.name,
            }
          );
        }
      });

      existingPlayerIds.forEach((id) => {
        if (!currentPetIds.has(id)) {
          gameStore.removePlayer(id);
        }
      });
    };

    if (pets.length > 0) {
      syncPetsToGame();
    }
  }, [pets]);

  useEffect(() => {
    const check = () => {
      const narrow = window.innerWidth < 1024;
      _setNarrowScreen(narrow);
      setLeftCollapsed(narrow);
      setRightCollapsed(narrow);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea') return;
      if (e.key === 'r' || e.key === 'R') { setDrawerOpen(drawerOpen === 'rewind' ? null : 'rewind'); }
      if (e.key === 'w' || e.key === 'W') { setDrawerOpen(drawerOpen === 'worldline' ? null : 'worldline'); }
      if (e.key === 't' || e.key === 'T') { setDrawerOpen(drawerOpen === 'todo' ? null : 'todo'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [drawerOpen]);

  const regionName = selectedPet?.current_region || '—';

  return (
    <div className="relative w-screen h-screen overflow-hidden game-background">
      <div className="relative z-10 flex flex-col h-full">
        <header className="flex-shrink-0 px-4 py-2 flex items-center gap-4 bg-brown-900/90 border-b-4 border-clay-700">
          <Link to="/" className="font-display text-2xl tracking-wider game-title flex-shrink-0">
            ✦ 星宠漫游馆
          </Link>
          <div className="flex-1 min-w-0 max-w-xl mx-auto">
            <WorldEventBanner />
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-xs text-clay-300 hidden sm:block font-body">
              {pets.length} 只星宠
            </div>
            <button
              onClick={() => setDrawerOpen('rewind')}
              title="天道回溯 (R)"
              className="pixel-button w-10 h-10 flex items-center justify-center text-brown-100 hover:text-brown-200 transition-all"
            >
              <span className="text-lg">⏳</span>
            </button>
            <button
              onClick={() => setDrawerOpen('worldline')}
              title="世界线 (W)"
              className="pixel-button w-10 h-10 flex items-center justify-center text-brown-100 hover:text-brown-200 transition-all"
            >
              <span className="text-lg">🌌</span>
            </button>
            <button
              onClick={() => setDrawerOpen('todo')}
              title="待办 (T)"
              className="pixel-button w-10 h-10 flex items-center justify-center text-brown-100 hover:text-brown-200 transition-all"
            >
              <span className="text-lg">✅</span>
            </button>
          </div>
        </header>

        <main className="flex-1 flex gap-2 px-2 pb-2 min-h-0">
          <aside
            className={`pixel-box flex-shrink-0 transition-all duration-300 overflow-hidden ${
              leftCollapsed ? 'w-0' : 'w-64'
            }`}
          >
            <div className="h-full p-3 overflow-hidden" style={{ background: '#181425' }}>
              <PetListPanel />
            </div>
          </aside>

          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="flex-shrink-0 self-center -ml-1 w-6 h-14 pixel-box flex items-center justify-center text-clay-300 hover:text-clay-100 transition-colors z-10"
            title={leftCollapsed ? '展开名册' : '折叠名册'}
            style={{ background: '#3A4466' }}
          >
            {leftCollapsed ? '▶' : '◀'}
          </button>

          <section className="flex-1 pixel-box overflow-hidden relative min-w-0" style={{ minWidth: '640px', background: '#181425' }}>
            <div className="w-full h-full" ref={gameContainerRef}>
              <Stage width={gameWidth} height={gameHeight} options={{ backgroundColor: 0x181425 }}>
                <PixiGame width={gameWidth} height={gameHeight} />
              </Stage>
            </div>
          </section>

          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="flex-shrink-0 self-center -mr-1 w-6 h-14 pixel-box flex items-center justify-center text-clay-300 hover:text-clay-100 transition-colors z-10"
            title={rightCollapsed ? '展开面板' : '折叠面板'}
            style={{ background: '#3A4466' }}
          >
            {rightCollapsed ? '◀' : '▶'}
          </button>

          <aside
            className={`pixel-box flex-shrink-0 transition-all duration-300 overflow-hidden ${
              rightCollapsed ? 'w-0' : 'w-96'
            }`}
          >
            <div 
              className="h-full p-4 overflow-y-auto" 
              style={{ background: '#181425' }}
              ref={scrollViewRef}
            >
              <PlayerDetails scrollViewRef={scrollViewRef} />
            </div>
          </aside>
        </main>

        <footer className="flex-shrink-0 px-4 py-2 flex items-center justify-between text-xs border-t-4 border-clay-700 bg-brown-900/90">
          <div className="text-clay-300 font-body">
            🌍 {regionName}
          </div>
          <div className="text-clay-500 font-body">
            {ERA_NAME}
          </div>
          <div className="text-clay-300 font-body">
            {selectedPet ? `${selectedPet.name} · ${wsConnected ? '在线' : '离线'}` : '未选择宠物'}
          </div>
        </footer>
      </div>

      <Drawer
        open={drawerOpen === 'rewind'}
        onClose={() => setDrawerOpen(null)}
        title="⏳ 天道回溯"
      >
        <RewindPanel charId={selectedId || ''} />
      </Drawer>

      <Drawer
        open={drawerOpen === 'worldline'}
        onClose={() => setDrawerOpen(null)}
        title="🌌 世界线"
      >
        <WorldlineDrawer />
      </Drawer>

      <Drawer
        open={drawerOpen === 'todo'}
        onClose={() => setDrawerOpen(null)}
        title="✅ 待办"
      >
        <TodoDrawer />
      </Drawer>
    </div>
  );
}
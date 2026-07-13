import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import GameEngine from '../../game/GameEngine';
import PetListPanel from '../../components/PetListPanel/PetListPanel';
import WorldEventBanner from '../../components/WorldEventBanner/WorldEventBanner';
import RightPanel from '../../components/RightPanel/RightPanel';
import Drawer from '../../components/Drawer/Drawer';
import RewindPanel from '../../components/RewindPanel/RewindPanel';
import WorldlineDrawer from '../../components/WorldlineDrawer/WorldlineDrawer';
import TodoDrawer from '../../components/TodoDrawer/TodoDrawer';
import { usePetStore } from '../../stores/petStore';

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
  current_region?: string;
  cultivation_level?: number;
}

export default function MainLayout() {
  const [leftCollapsed, setLeftCollapsed] = useState(false);
  const [rightCollapsed, setRightCollapsed] = useState(false);
  const [_narrowScreen, _setNarrowScreen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState<string | null>(null);

  const { pets, selectedId, fetchPets, connectWebSocket, disconnectWebSocket, wsConnected } = usePetStore();
  const selectedPet = pets.find((p: Pet) => p.id === selectedId) || null;

  useEffect(() => {
    fetchPets();
    connectWebSocket();
    return () => {
      disconnectWebSocket();
    };
  }, []);

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
    <div className="relative w-screen h-screen overflow-hidden starfield">
      <div className="relative z-10 flex flex-col h-full">
        <header className="flex-shrink-0 p-3 flex items-center gap-3">
          <Link to="/" className="font-display text-xl tracking-wider text-gradient-cosmos flex-shrink-0">
            ✦ 星宠漫游馆
          </Link>
          <div className="flex-1 min-w-0 max-w-xl mx-auto">
            <WorldEventBanner />
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="text-xs text-cosmos-400 hidden sm:block">
              {pets.length} 只星宠
            </div>
            <button
              onClick={() => setDrawerOpen('rewind')}
              title="天道回溯 (R)"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-cosmos-200 hover:text-white hover:border-cosmos-400 transition-all"
            >
              ⏳
            </button>
            <button
              onClick={() => setDrawerOpen('worldline')}
              title="世界线 (W)"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-cosmos-200 hover:text-white hover:border-cosmos-400 transition-all"
            >
              🌌
            </button>
            <button
              onClick={() => setDrawerOpen('todo')}
              title="待办 (T)"
              className="w-9 h-9 rounded-lg glass flex items-center justify-center text-cosmos-200 hover:text-white hover:border-cosmos-400 transition-all"
            >
              ✅
            </button>
          </div>
        </header>

        <main className="flex-1 flex gap-3 px-3 pb-3 min-h-0">
          <aside
            className={`glass flex-shrink-0 transition-all duration-300 overflow-hidden ${
              leftCollapsed ? 'w-0 border-transparent' : 'w-64'
            }`}
          >
            <div className="h-full p-3 overflow-hidden">
              <PetListPanel />
            </div>
          </aside>

          <button
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            className="flex-shrink-0 self-center -ml-1 w-6 h-12 glass rounded-r-lg flex items-center justify-center text-cosmos-400 hover:text-cosmos-200 transition-colors z-10"
            title={leftCollapsed ? '展开名册' : '折叠名册'}
          >
            {leftCollapsed ? '▶' : '◀'}
          </button>

          <section className="flex-1 glass overflow-hidden relative min-w-0" style={{ minWidth: '640px' }}>
            <GameEngine currentLocation="qingqiu" />
          </section>

          <button
            onClick={() => setRightCollapsed(!rightCollapsed)}
            className="flex-shrink-0 self-center -mr-1 w-6 h-12 glass rounded-l-lg flex items-center justify-center text-cosmos-400 hover:text-cosmos-200 transition-colors z-10"
            title={rightCollapsed ? '展开面板' : '折叠面板'}
          >
            {rightCollapsed ? '◀' : '▶'}
          </button>

          <aside
            className={`glass flex-shrink-0 transition-all duration-300 overflow-hidden ${
              rightCollapsed ? 'w-0 border-transparent' : 'w-80'
            }`}
          >
            <div className="h-full p-3 overflow-hidden">
              <RightPanel />
            </div>
          </aside>
        </main>

        <footer className="flex-shrink-0 px-4 py-2 flex items-center justify-between text-xs border-t border-cosmos-800/30 bg-cosmos-950/50 backdrop-blur-sm">
          <div className="text-cosmos-400">
            🌍 {regionName}
          </div>
          <div className="text-cosmos-500 font-body">
            {ERA_NAME}
          </div>
          <div className="text-cosmos-400">
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

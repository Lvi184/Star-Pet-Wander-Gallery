import { useState, useEffect } from 'react';
import GameEngine from '../../game/GameEngine';
import { useGameStore } from '../../game/zustand/store';
import { REGIONS, REGION_NAMES, REGION_DESCRIPTIONS, FATE_NAMES, FATE_COLORS, MAX_HEALTH, MAX_ENERGY, MAX_HAPPINESS } from '../../game/constants';
import { characterApi, destinyApi } from '../../services/api';

const Explore = () => {
  const [currentLocation, setCurrentLocation] = useState(REGIONS.QINGQIU);
  const [notification, setNotification] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [showDestinyPanel, setShowDestinyPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  const heroState = useGameStore((state) => state.heroData.state);
  const inventory = useGameStore((state) => state.inventory.items);
  const fateLevel = useGameStore((state) => state.world.fateLevel);
  const day = useGameStore((state) => state.world.day);

  useEffect(() => {
    setNotification('🔮 欢迎来到星宠世界！');
    setTimeout(() => setNotification(''), 3000);
  }, []);

  useEffect(() => {
    const loadDestiny = async () => {
      try {
        const response = await destinyApi.getByRegion(currentLocation);
        if (response.data && response.data.fate) {
          useGameStore.getState().world.setters.setFateLevel(response.data.fate);
        }
      } catch (error) {
        console.error('Failed to load destiny:', error);
      }
    };

    loadDestiny();
  }, [currentLocation]);

  const handleLocationChange = (location: string) => {
    setCurrentLocation(location);
    setNotification(`📍 进入了 ${REGION_NAMES[location]}`);
    setTimeout(() => setNotification(''), 3000);
  };

  const regions = Object.entries(REGIONS).map(([key, value]) => ({
    id: value,
    name: REGION_NAMES[value],
    description: REGION_DESCRIPTIONS[value],
    unlocked: key === 'QINGQIU' || key === 'KUNLUN' || key === 'DONGHAI',
  }));

  const handleReleaseControl = async () => {
    setLoading(true);
    try {
      await characterApi.release('player');
      setNotification('🦊 灵兽开始自主行动！');
    } catch (error) {
      console.error('Failed to release control:', error);
    } finally {
      setLoading(false);
    }
  };

  const healthPercent = (heroState.health / MAX_HEALTH) * 100;
  const energyPercent = (heroState.energy / MAX_ENERGY) * 100;
  const happinessPercent = (heroState.happiness / MAX_HAPPINESS) * 100;

  return (
    <div className="flex flex-col h-screen bg-bg overflow-hidden">
      <header className="bg-bg2/90 border-b-4 border-clay-700 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/game/images/crystal.png" alt="explore" className="w-8 h-8 pixelated" />
          <h1 className="font-display text-xl text-accent glow-text">星宠世界探索</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-clay-700/50 rounded border-2 border-accent/30">
            <span className="text-xs text-muted font-body">第 {day} 天</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-clay-700/50 rounded border-2 border-accent/30">
            <span className="text-xs text-muted font-body">命运</span>
            <span 
              className="font-display text-white px-3 py-1 rounded"
              style={{ backgroundColor: FATE_COLORS[fateLevel] }}
            >
              {FATE_NAMES[fateLevel]}
            </span>
          </div>
          <button
            onClick={handleReleaseControl}
            disabled={loading}
            className="game-button px-4 py-2 disabled:opacity-50"
          >
            {loading ? '释放中...' : '🦊 释放灵兽'}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-72 bg-bg2/80 border-r-4 border-clay-700 p-4 overflow-y-auto flex flex-col">
          <div className="mb-4">
            <h2 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
              🗺️ 区域地图
            </h2>
            <div className="space-y-2">
              {regions.map((region) => (
                <button
                  key={region.id}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    currentLocation === region.id
                      ? 'bg-accent/20 border-accent text-accent'
                      : region.unlocked
                      ? 'bg-bg border-clay-600 hover:border-accent text-ink'
                      : 'bg-gray-800/50 border-gray-700 text-gray-500 opacity-60 cursor-not-allowed'
                  }`}
                  disabled={!region.unlocked}
                  onClick={() => region.unlocked && handleLocationChange(region.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm">{region.name}</span>
                    {!region.unlocked && <span>🔒</span>}
                    {currentLocation === region.id && <span>📍</span>}
                  </div>
                  <div className="text-xs text-muted font-body mt-1">{region.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
              ❤️ 角色状态
            </h2>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">生命值</span>
                  <span className="text-red-400">{heroState.health}/{MAX_HEALTH}</span>
                </div>
                <div className="h-3 bg-clay-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-500 transition-all duration-300"
                    style={{ width: `${healthPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">精力值</span>
                  <span className="text-yellow-400">{heroState.energy}/{MAX_ENERGY}</span>
                </div>
                <div className="h-3 bg-clay-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500 transition-all duration-300"
                    style={{ width: `${energyPercent}%` }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white">快乐值</span>
                  <span className="text-green-400">{heroState.happiness}/{MAX_HAPPINESS}</span>
                </div>
                <div className="h-3 bg-clay-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-300"
                    style={{ width: `${happinessPercent}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="bg-bg p-3 rounded border-2 border-clay-600">
                  <div className="text-xs text-muted font-body">等级</div>
                  <div className="font-display text-xl text-accent">{heroState.level}</div>
                </div>
                <div className="bg-bg p-3 rounded border-2 border-clay-600">
                  <div className="text-xs text-muted font-body">星币</div>
                  <div className="font-display text-xl text-accent">{heroState.gold}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg text-accent">🎒 背包</h2>
              <button
                onClick={() => setShowInventory(!showInventory)}
                className="text-xs text-accent hover:text-white"
              >
                {showInventory ? '收起' : '展开'}
              </button>
            </div>
            {showInventory ? (
              <div className="space-y-2 mt-3">
                {inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2 bg-bg rounded border-2 border-clay-600"
                  >
                    <div className="w-10 h-10 bg-accent/20 rounded flex items-center justify-center">
                      <img 
                        src={`/assets/game/images/${item.icon}.png`} 
                        alt={item.name} 
                        className="w-6 h-6 pixelated"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm text-white">{item.name}</div>
                      <div className="text-xs text-muted font-body">×{item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-2 mt-3">
                {inventory.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="aspect-square bg-bg border-2 border-clay-600 rounded flex items-center justify-center relative"
                  >
                    <img 
                      src={`/assets/game/images/${item.icon}.png`} 
                      alt={item.name} 
                      className="w-6 h-6 pixelated"
                    />
                    {item.quantity > 1 && (
                      <span className="absolute -top-1 -right-1 bg-accent text-xs px-1 rounded">
                        {item.quantity}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-auto">
            <h2 className="font-display text-sm text-accent mb-3">⚡ 快捷操作</h2>
            <div className="space-y-2">
              <button 
                onClick={() => setShowDestinyPanel(true)}
                className="game-button w-full text-xs"
              >
                查看命运
              </button>
              <button className="game-button w-full text-xs">打开背包</button>
              <button className="game-button w-full text-xs">返回首页</button>
            </div>

            <div className="mt-6 p-3 bg-clay-700/50 rounded-lg border-2 border-clay-600">
              <h3 className="font-display text-sm text-accent mb-2">🎮 操作说明</h3>
              <div className="text-xs text-muted font-body space-y-1">
                <p>W/↑ - 向上移动</p>
                <p>S/↓ - 向下移动</p>
                <p>A/← - 向左移动</p>
                <p>D/→ - 向右移动</p>
                <p>空格 - 互动/对话</p>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 relative">
          <GameEngine currentLocation={currentLocation} />

          {notification && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 bg-bg2/95 border-2 border-accent rounded-lg shadow-lg z-10">
              <p className="font-display text-accent">{notification}</p>
            </div>
          )}
        </main>
      </div>

      {showDestinyPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bg2 border-4 border-accent rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-display text-xl text-accent mb-4">🔮 今日命运</h3>
            <div className="space-y-4">
              <div className="bg-bg p-4 rounded-lg border-2 border-clay-600">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted font-body">命运等级</span>
                  <span 
                    className="font-display text-xl px-4 py-2 rounded"
                    style={{ backgroundColor: FATE_COLORS[fateLevel], color: '#ffffff' }}
                  >
                    {FATE_NAMES[fateLevel]}
                  </span>
                </div>
                <p className="text-sm text-white">
                  {fateLevel === 'peaceful' && '今日祥和，适合修炼和探索。'}
                  {fateLevel === 'normal' && '今日平凡，一切照常进行。'}
                  {fateLevel === 'dangerous' && '今日凶险，外出需谨慎！'}
                  {fateLevel === 'disaster' && '今日灾难，建议待在安全地带！'}
                </p>
              </div>
              <div className="bg-bg p-4 rounded-lg border-2 border-clay-600">
                <div className="text-sm text-muted font-body mb-2">区域命运</div>
                <div className="grid grid-cols-2 gap-2">
                  {regions.slice(0, 4).map((region) => (
                    <div key={region.id} className="text-xs">
                      <div className="text-white">{region.name}</div>
                      <div className="text-muted font-body">未知</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowDestinyPanel(false)}
              className="w-full game-button mt-4 px-4 py-2"
            >
              关闭
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Explore;

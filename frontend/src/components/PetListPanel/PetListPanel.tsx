import { usePetStore, Pet } from '../../stores/petStore';
import { Link } from 'react-router-dom';

const speciesEmoji: Record<string, string> = {
  fox: '🦊',
  dragon: '🐉',
  phoenix: '🦅',
  turtle: '🐢',
  cat: '🐱',
  狐狸: '🦊',
  龙族: '🐉',
  凤凰: '🦅',
  灵龟: '🐢',
  星灵猫: '🐱',
  九尾狐: '🦊',
  应龙: '🐉',
  朱雀: '🦅',
  玄武: '🐢',
  白虎: '🐯',
  麒麟: '🦄',
};

const regionNames: Record<string, string> = {
  qingqiu: '青丘',
  kunlun: '昆仑',
  donghai: '东海',
  lingxu: '灵墟',
  youdu: '幽都',
  xinghai: '星海',
};

function getHealthColor(health: number) {
  if (health >= 60) return 'bg-jade-500';
  if (health >= 30) return 'bg-gold-500';
  return 'bg-red-500';
}

function PetItem({ pet, selected, onClick }: { pet: Pet; selected: boolean; onClick: () => void }) {
  const isDead = pet.status === 'dead';
  const emoji = speciesEmoji[pet.species] || '✨';
  const regionName = pet.current_region ? regionNames[pet.current_region] || pet.current_region : '未知区域';
  const controlIcon = pet.controller_type === 'player' ? '🎮' : '🤖';
  const controlLabel = pet.controller_type === 'player' ? '玩家控制' : 'AI漫游';

  return (
    <button
      onClick={onClick}
      disabled={isDead}
      className={`w-full text-left p-3 rounded-lg transition-all duration-200 border ${
        selected
          ? 'border-cosmos-400 bg-cosmos-900/60 shadow-lg shadow-cosmos-500/20'
          : 'border-cosmos-800/50 bg-cosmos-950/40 hover:border-cosmos-600 hover:bg-cosmos-900/50'
      } ${isDead ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <div className="flex items-center gap-3">
        <div className="text-3xl">{emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-white truncate">{pet.name}</span>
            {isDead && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-red-900/50 text-red-300 border border-red-700/50 shrink-0">
                已逝
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-cosmos-300">{regionName}</span>
            <span className="text-xs text-cosmos-400">{controlIcon} {controlLabel}</span>
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-cosmos-900 rounded-full overflow-hidden">
              <div
                className={`h-full ${getHealthColor(pet.health)} transition-all duration-700 rounded-full bar-shine`}
                style={{ width: `${Math.max(0, Math.min(100, pet.health))}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

export default function PetListPanel() {
  const { pets, selectedId, selectPet, loading, error } = usePetStore();
  const sortedPets = [...pets].sort((a, b) => {
    if (a.status === 'dead' && b.status !== 'dead') return 1;
    if (a.status !== 'dead' && b.status === 'dead') return -1;
    return (b.last_active || '').localeCompare(a.last_active || '');
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gradient-cosmos">🌟 星宠名册</h2>
        <Link
          to="/create"
          className="px-3 py-1.5 text-sm rounded-lg bg-gradient-to-r from-cosmos-500 to-gold-500 text-white font-medium hover:opacity-90 transition-opacity"
        >
          + 召唤
        </Link>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-cosmos-300 text-sm">加载中...</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="text-red-400 text-sm">连接异常</div>
          <button
            onClick={() => usePetStore.getState().fetchPets()}
            className="px-3 py-1 text-sm rounded bg-cosmos-700 text-cosmos-100 hover:bg-cosmos-600 transition"
          >
            重试
          </button>
        </div>
      )}

      {!loading && !error && sortedPets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-5xl">🌌</div>
          <div className="text-cosmos-300 text-sm">还没有星宠</div>
          <Link
            to="/create"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-cosmos-500 to-gold-500 text-white text-sm font-medium hover:opacity-90 transition-opacity"
          >
            召唤第一只
          </Link>
        </div>
      )}

      {!loading && !error && sortedPets.length > 0 && (
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 -mr-1">
          {sortedPets.map((pet) => (
            <PetItem
              key={pet.id}
              pet={pet}
              selected={pet.id === selectedId}
              onClick={() => selectPet(pet.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

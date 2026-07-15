import { usePetStore, Pet } from '../../stores/petStore';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const speciesEmoji: Record<string, string> = {
  fox: '🦊',
  dragon: '🐉',
  phoenix: '🦅',
  turtle: '🐢',
  tiger: '🐯',
  qilin: '🦄',
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

const speciesImages: Record<string, string[]> = {
  fox: ['/pets/哈基咪.webp', '/pets/妙脆角咪.png'],
  dragon: ['/pets/香蕉猫.gif', '/pets/月薪咪.webp'],
  phoenix: ['/pets/月薪咪F4.webp', '/pets/绿色外星咪.webp'],
  turtle: ['/pets/刀盾.JPG', '/pets/蜘蛛咪.webp'],
  tiger: ['/pets/月薪咪吓.webp', '/pets/哈基咪.webp'],
  qilin: ['/pets/妙脆角咪.png', '/pets/绿色外星咪.webp'],
  cat: ['/pets/哈基咪.webp', '/pets/妙脆角咪.png'],
};

function getSpeciesImage(species: string, name: string): string {
  const images = speciesImages[species] || speciesImages.cat;
  const index = name.charCodeAt(0) % images.length;
  return images[index];
}

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
  const [switching, setSwitching] = useState(false);
  const { switchController } = usePetStore();
  const isDead = pet.status === 'dead';
  const emoji = speciesEmoji[pet.species] || '✨';
  const imageUrl = getSpeciesImage(pet.species, pet.name);
  const regionName = pet.current_region ? regionNames[pet.current_region] || pet.current_region : '未知区域';
  const controlIcon = pet.controller_type === 'player' ? '🎮' : '🤖';
  const controlLabel = pet.controller_type === 'player' ? '切换AI' : '我来控制';

  const handleSwitchControl = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDead || switching) return;
    setSwitching(true);
    try {
      await switchController(pet.id, pet.controller_type === 'player' ? 'agent' : 'player');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={isDead}
      className={`w-full text-left p-3 transition-all duration-200 ${
        selected
          ? 'bg-clay-700/80 border-2 border-clay-500'
          : 'bg-clay-900/80 border-2 border-clay-800 hover:border-clay-600'
      } ${isDead ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ clipPath: 'polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))' }}
    >
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full overflow-hidden bg-clay-800 border-2 border-clay-600 flex items-center justify-center">
          <img 
            src={imageUrl} 
            alt={pet.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).parentElement!.textContent = emoji;
              (e.target as HTMLImageElement).parentElement!.style.fontSize = '24px';
            }}
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className="font-display text-lg text-brown-100 truncate shadow-solid">{pet.name}</span>
            {isDead && (
              <span className="text-xs px-2 py-0.5 bg-red-900/80 text-red-300 border-2 border-red-700 shrink-0">
                已逝
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-clay-300 font-body">{regionName}</span>
            <span className="text-xs text-clay-400 font-body">{controlIcon}</span>
          </div>
          <div className="mt-2 game-progress-bar h-3">
            <div
              className={`h-full ${getHealthColor(pet.health)} game-progress-bar-progress transition-all duration-700`}
              style={{ width: `${Math.max(0, Math.min(100, pet.health))}%` }}
            />
          </div>
        </div>
        <button
          onClick={handleSwitchControl}
          disabled={isDead || switching}
          className={`px-2 py-1 text-xs font-body transition-all duration-200 ${
            pet.controller_type === 'player'
              ? 'bg-green-900/60 text-green-300 border border-green-700 hover:bg-green-800/80'
              : 'bg-blue-900/60 text-blue-300 border border-blue-700 hover:bg-blue-800/80'
          } ${isDead || switching ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
          style={{ clipPath: 'polygon(0 0, calc(100% - 4px) 0, 100% 4px, 100% 100%, 4px 100%, 0 calc(100% - 4px))' }}
        >
          {switching ? '...' : controlLabel}
        </button>
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
        <h2 className="font-display text-lg text-brown-200 shadow-solid">🌟 星宠名册</h2>
        <Link
          to="/create"
          className="pixel-button px-3 py-1 text-sm text-brown-100 hover:text-brown-200"
        >
          <span>+ 召唤</span>
        </Link>
      </div>

      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-clay-300 text-sm font-body">加载中...</div>
        </div>
      )}

      {error && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-3">
          <div className="text-red-400 text-sm font-body">连接异常</div>
          <button
            onClick={() => usePetStore.getState().fetchPets()}
            className="pixel-button px-3 py-1 text-sm text-brown-100"
          >
            <span>重试</span>
          </button>
        </div>
      )}

      {!loading && !error && sortedPets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center gap-4">
          <div className="text-5xl">🌌</div>
          <div className="text-clay-300 text-sm font-body">还没有星宠</div>
          <Link
            to="/create"
            className="pixel-button px-4 py-2 text-brown-100"
          >
            <span>召唤第一只</span>
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

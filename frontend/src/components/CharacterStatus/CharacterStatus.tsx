import { useState, useEffect } from 'react';
import api from '../../services/api';

interface CharacterData {
  id: string;
  name: string;
  species: string;
  personality: Record<string, number>;
  mood: number;
  energy: number;
  health: number;
  status: string;
  controller_type: string;
  controller_version: number;
  current_region: string;
  position_x: number;
  position_y: number;
}

interface CharacterStatusProps {
  charId: string;
}

const speciesNames: Record<string, string> = {
  fox: '九尾狐',
  dragon: '应龙',
  phoenix: '朱雀',
  turtle: '玄武',
  tiger: '白虎',
  qilin: '麒麟'
};

const statusColors: Record<string, string> = {
  normal: 'bg-green-500',
  injured: 'bg-yellow-500',
  critical: 'bg-orange-500',
  dead: 'bg-red-500'
};

const statusLabels: Record<string, string> = {
  normal: '正常',
  injured: '受伤',
  critical: '危急',
  dead: '死亡'
};

const regionNames: Record<string, string> = {
  qingqiu: '青丘',
  kunlun: '昆仑',
  donghai: '东海',
  lingxu: '灵墟',
  youdu: '幽都',
  xinghai: '星海'
};

export default function CharacterStatus({ charId }: CharacterStatusProps) {
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPlayerControlled, setIsPlayerControlled] = useState(false);

  useEffect(() => {
    fetchCharacter();
  }, [charId]);

  const fetchCharacter = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/character/${charId}/status`);
      setCharacter(response.data);
      setIsPlayerControlled(response.data.controller_type === 'player');
    } catch (error) {
      console.error('Failed to fetch character:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTakeover = async () => {
    try {
      await api.post(`/character/${charId}/control/takeover`);
      setIsPlayerControlled(true);
      await fetchCharacter();
    } catch (error: any) {
      alert(error.response?.data?.detail || '接管失败');
    }
  };

  const handleRelease = async () => {
    try {
      await api.post(`/character/${charId}/control/release`);
      setIsPlayerControlled(false);
      await fetchCharacter();
    } catch (error: any) {
      alert(error.response?.data?.detail || '交还控制权失败');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-center text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!character) {
    return null;
  }

  const getBarColor = (value: number) => {
    if (value >= 70) return 'bg-green-500';
    if (value >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-3xl">
            {speciesNames[character.species]?.[0] || '?'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">{character.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400">{speciesNames[character.species] || character.species}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[character.status]} text-white`}>
                {statusLabels[character.status]}
              </span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {isPlayerControlled ? (
            <button
              onClick={handleRelease}
              className="px-3 py-1 rounded-full text-sm bg-orange-500 text-white hover:bg-orange-600"
            >
              交还AI
            </button>
          ) : (
            <button
              onClick={handleTakeover}
              disabled={character.status === 'dead'}
              className={`px-3 py-1 rounded-full text-sm ${character.status === 'dead' ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
            >
              接管控制
            </button>
          )}
          <span className={`text-xs px-2 py-1 rounded-full ${isPlayerControlled ? 'bg-blue-600 text-white' : 'bg-purple-600 text-white'}`}>
            {isPlayerControlled ? '🎮 玩家控制' : '🤖 AI控制'}
          </span>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">❤️ 生命值</span>
            <span className="text-white">{character.health.toFixed(0)}/100</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${getBarColor(character.health)} transition-all duration-500`} style={{ width: `${character.health}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">⚡ 能量值</span>
            <span className="text-white">{character.energy.toFixed(0)}/100</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${getBarColor(character.energy)} transition-all duration-500`} style={{ width: `${character.energy}%` }}></div>
          </div>
        </div>
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-slate-400">😊 心情值</span>
            <span className="text-white">{character.mood.toFixed(0)}/100</span>
          </div>
          <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
            <div className={`h-full ${getBarColor(character.mood)} transition-all duration-500`} style={{ width: `${character.mood}%` }}></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-3">
        <div className="text-slate-400 text-sm mb-2">人格六维</div>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(character.personality).map(([trait, value]) => (
            <div key={trait} className="text-center">
              <div className="text-white text-sm font-semibold">
                {trait === 'braveness' ? '勇气' : 
                 trait === 'curiosity' ? '好奇' : 
                 trait === 'kindness' ? '善良' : 
                 trait === 'independence' ? '独立' : 
                 trait === 'playfulness' ? '活泼' : 
                 trait === 'wisdom' ? '智慧' : trait}
              </div>
              <div className="text-cyan-400 text-lg">⭐{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-slate-700 rounded-lg p-2">
          <div className="text-slate-400">当前区域</div>
          <div className="text-white">{regionNames[character.current_region] || character.current_region}</div>
        </div>
        <div className="bg-slate-700 rounded-lg p-2">
          <div className="text-slate-400">位置坐标</div>
          <div className="text-white">({character.position_x.toFixed(0)}, {character.position_y.toFixed(0)})</div>
        </div>
      </div>
    </div>
  );
}
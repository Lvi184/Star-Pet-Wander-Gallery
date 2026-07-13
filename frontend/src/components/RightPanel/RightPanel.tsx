import { useState } from 'react';
import { usePetStore } from '../../stores/petStore';
import DiaryTimeline from '../Diary/DiaryTimeline';
import { PetDiary } from '../Diary/DiaryTimeline';

const speciesNames: Record<string, string> = {
  fox: '九尾狐', dragon: '应龙', phoenix: '朱雀', turtle: '玄武',
  tiger: '白虎', qilin: '麒麟',
  狐狸: '九尾狐', 龙族: '应龙', 凤凰: '朱雀', 灵龟: '玄武',
  星灵猫: '星灵猫', 九尾狐: '九尾狐', 应龙: '应龙', 朱雀: '朱雀',
  玄武: '玄武', 白虎: '白虎', 麒麟: '麒麟',
};

const speciesEmoji: Record<string, string> = {
  fox: '🦊', dragon: '🐉', phoenix: '🦅', turtle: '🐢',
  tiger: '🐯', qilin: '🦄',
  狐狸: '🦊', 龙族: '🐉', 凤凰: '🦅', 灵龟: '🐢',
  星灵猫: '🐱', 九尾狐: '🦊', 应龙: '🐉', 朱雀: '🦅',
  玄武: '🐢', 白虎: '🐯', 麒麟: '🦄',
};

const regionNames: Record<string, string> = {
  qingqiu: '青丘秘境', kunlun: '昆仑之墟', donghai: '东海龙宫',
  lingxu: '灵墟福地', youdu: '幽都冥府', xinghai: '星海彼岸',
};

const destinyLevels = [
  { level: 1, name: '平凡命格', class: 'destiny-lv1', bg: 'destiny-bg-lv1' },
  { level: 2, name: '灵动命格', class: 'destiny-lv2', bg: 'destiny-bg-lv2' },
  { level: 3, name: '奇缘命格', class: 'destiny-lv3', bg: 'destiny-bg-lv3' },
  { level: 4, name: '天选命格', class: 'destiny-lv4', bg: 'destiny-bg-lv4' },
  { level: 5, name: '帝命命格', class: 'destiny-lv5', bg: 'destiny-bg-lv5' },
];

const moodMap: Record<string, { emoji: string; label: string; cls: string }> = {
  happy: { emoji: '😊', label: '愉悦', cls: 'mood-happy' },
  calm: { emoji: '😌', label: '平静', cls: 'mood-calm' },
  excited: { emoji: '🤩', label: '兴奋', cls: 'mood-excited' },
  sad: { emoji: '😢', label: '低落', cls: 'mood-sad' },
  curious: { emoji: '🧐', label: '好奇', cls: 'mood-curious' },
};

const statusLabels: Record<string, string> = {
  normal: '正常', injured: '受伤', critical: '危急', dead: '死亡',
};

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 bg-cosmos-900/80 rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-700 rounded-full bar-shine`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default function RightPanel() {
  const { pets, selectedId, switchController, wsConnected } = usePetStore();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const pet = pets.find((p) => p.id === selectedId) || null;

  if (!pet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-3 opacity-30">✨</div>
          <div className="text-cosmos-400 text-sm">请选择一只宠物</div>
        </div>
      </div>
    );
  }

  const speciesName = speciesNames[pet.species] || pet.species;
  const emoji = speciesEmoji[pet.species] || '✨';
  const regionName = pet.current_region ? regionNames[pet.current_region] || pet.current_region : '未知区域';
  const destinyLevel = Math.min(5, Math.max(1, pet.cultivation_level || 1));
  const destiny = destinyLevels[destinyLevel - 1];
  const moodKey = typeof pet.mood === 'number'
    ? (pet.mood > 80 ? 'happy' : pet.mood > 60 ? 'excited' : pet.mood > 40 ? 'calm' : pet.mood > 20 ? 'curious' : 'sad')
    : (pet.mood as string) || 'calm';
  const mood = moodMap[moodKey] || moodMap.calm;
  const isDead = pet.status === 'dead';
  const isPlayer = pet.controller_type === 'player';

  const mockDiaries: PetDiary[] = [
    {
      id: '1',
      title: '游荡',
      content: `${pet.name}在${regionName}游荡，似乎在寻找什么...`,
      created_at: new Date().toISOString(),
      mood: moodKey,
    },
    {
      id: '2',
      title: '小憩',
      content: '日光正好，找了个舒服的地方打了个盹。',
      created_at: new Date(Date.now() - 3600000).toISOString(),
      mood: 'calm',
    },
    {
      id: '3',
      title: '发现',
      content: '发现了一处神秘的灵气汇聚之地，正在探索中...',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      mood: 'curious',
    },
  ];

  const handleSwitch = async () => {
    if (isDead || switching) return;
    setSwitching(true);
    setSwitchError(null);
    try {
      await switchController(pet.id, isPlayer ? 'agent' : 'player');
    } catch (err: any) {
      setSwitchError(err.message || '切换失败');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-3 overflow-y-auto pr-1">
      <div className="glass p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cosmos-400 to-gold-400 flex items-center justify-center text-3xl shadow-lg shadow-cosmos-500/30">
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">{pet.name}</h2>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${destiny.bg} ${destiny.class} font-medium`}>
                ✦ {destiny.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-cosmos-300">{speciesName}</span>
              <span className="text-cosmos-600">·</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cosmos-900/60 text-cosmos-300 border border-cosmos-800/50">
                {statusLabels[pet.status] || pet.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cosmos-400">❤️ 生命</span>
              <span className="text-white">{Math.round(pet.health)}/100</span>
            </div>
            <Bar value={pet.health} color={pet.health >= 60 ? 'bg-jade-500' : pet.health >= 30 ? 'bg-gold-500' : 'bg-red-500'} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cosmos-400">⚡ 能量</span>
              <span className="text-white">{Math.round(pet.energy)}/100</span>
            </div>
            <Bar value={pet.energy} color="bg-cosmos-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cosmos-400">{mood.emoji} 心情</span>
              <span className={`${mood.cls}`}>{mood.label}</span>
            </div>
            <Bar value={typeof pet.mood === 'number' ? pet.mood : 50} color="bg-gold-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-cosmos-400">🔮 灵力</span>
              <span className="text-jade-300">{Math.round(pet.spiritual_power)}</span>
            </div>
            <Bar value={Math.min(100, pet.spiritual_power / 10)} color="bg-jade-400" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-cosmos-900/50 rounded-lg p-2 border border-cosmos-800/50">
            <div className="text-cosmos-400 text-[10px] uppercase tracking-wider">当前区域</div>
            <div className="text-white text-sm font-medium mt-0.5">{regionName}</div>
          </div>
          <div className="bg-cosmos-900/50 rounded-lg p-2 border border-cosmos-800/50">
            <div className="text-cosmos-400 text-[10px] uppercase tracking-wider">境界</div>
            <div className="text-gold-300 text-sm font-medium mt-0.5">炼气 {pet.cultivation_level} 层</div>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={handleSwitch}
            disabled={isDead || switching}
            className={`w-full py-2 rounded-lg font-medium text-sm transition-all ${
              isDead
                ? 'bg-cosmos-900/50 text-cosmos-500 cursor-not-allowed border border-cosmos-800/50'
                : isPlayer
                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white hover:opacity-90 shadow-lg shadow-orange-500/20'
                : 'bg-gradient-to-r from-cosmos-500 to-cosmos-400 text-white hover:opacity-90 shadow-lg shadow-cosmos-500/20'
            }`}
          >
            {switching ? '切换中...' : isDead ? '💀 已逝' : isPlayer ? '🤖 切换 AI 漫游' : '🎮 接管控制'}
          </button>
          {switchError && (
            <div className="mt-1 text-xs text-red-400 text-center">{switchError}</div>
          )}
          <div className="mt-2 flex items-center justify-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-jade-400' : 'bg-red-400'}`} />
            <span className="text-cosmos-400">{wsConnected ? '实时同步中' : '连接断开'}</span>
          </div>
        </div>
      </div>

      <div className="glass p-4 flex-1 overflow-hidden flex flex-col">
        <h3 className="text-sm font-semibold text-gradient-cosmos mb-3">📜 今日漫游志</h3>
        <div className="flex-1 overflow-y-auto pr-1">
          <DiaryTimeline diaries={mockDiaries} compact />
        </div>
      </div>
    </div>
  );
}

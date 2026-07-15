import { useState, useEffect } from 'react';
import { usePetStore, ExploreEvent } from '../../stores/petStore';

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
  'star-forest': '星光森林', 'moon-lake': '月牙湖', 'crater': '陨石坑',
  'crystal-cave': '水晶洞窟', 'cloud-peaks': '云巅峰', 'abyss': '深渊裂谷',
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

const actionTypeIcons: Record<string, string> = {
  explore: '🗺️',
  discover: '✨',
  collect: '🎁',
  move: '🚶',
  rest: '😴',
  socialize: '👥',
  social: '👥',
};

const actionTypeLabels: Record<string, string> = {
  explore: '探索',
  discover: '发现',
  collect: '采集',
  move: '移动',
  rest: '休息',
  socialize: '社交',
  social: '社交',
};

function Bar({ value, color }: { value: number; color: string }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="game-progress-bar h-3">
      <div
        className={`h-full ${color} game-progress-bar-progress transition-all duration-700`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function EventItem({ event }: { event: ExploreEvent }) {
  const icon = actionTypeIcons[event.action_type] || '📌';
  const label = actionTypeLabels[event.action_type] || event.action_type;
  const regionName = regionNames[event.location] || event.location;
  const timestamp = event.timestamp ? new Date(event.timestamp) : null;
  const timeStr = timestamp ? `${timestamp.getHours().toString().padStart(2, '0')}:${timestamp.getMinutes().toString().padStart(2, '0')}` : '';

  return (
    <div className="flex gap-2 py-2 border-b border-clay-700/50 last:border-0">
      <div className="text-lg shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-xs px-1.5 py-0.5 bg-clay-800 text-clay-300 border border-clay-600">
            {label}
          </span>
          {regionName && (
            <span className="text-xs text-clay-400">{regionName}</span>
          )}
          {timeStr && (
            <span className="text-xs text-clay-500 ml-auto">{timeStr}</span>
          )}
        </div>
        <div className="text-sm text-brown-200 mt-1 line-clamp-2">{event.detail}</div>
      </div>
    </div>
  );
}

export default function RightPanel() {
  const { pets, selectedId, switchController, wsConnected, events, fetchEvents } = usePetStore();
  const [switching, setSwitching] = useState(false);
  const [switchError, setSwitchError] = useState<string | null>(null);

  const pet = pets.find((p) => p.id === selectedId) || null;

  useEffect(() => {
    if (selectedId) {
      fetchEvents(selectedId);
    }
  }, [selectedId, fetchEvents]);

  if (!pet) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-3 opacity-30">✨</div>
          <div className="text-clay-400 text-sm font-body">请选择一只宠物</div>
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
      <div className="pixel-card p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-14 h-14 bg-gradient-to-br from-clay-600 to-brown-500 flex items-center justify-center text-3xl border-4 border-clay-500"
               style={{ clipPath: 'polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 10px 100%, 0 calc(100% - 10px))' }}>
            {emoji}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-display text-lg text-brown-100 truncate shadow-solid">{pet.name}</h2>
              <span className={`text-xs px-2 py-0.5 border-2 ${destiny.bg} ${destiny.class} font-body`}>
                ✦ {destiny.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm text-clay-300 font-body">{speciesName}</span>
              <span className="text-clay-600">·</span>
              <span className="text-xs px-1.5 py-0.5 bg-clay-900/80 text-clay-300 border-2 border-clay-700 font-body">
                {statusLabels[pet.status] || pet.status}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-clay-400 font-body">❤️ 生命</span>
              <span className="text-brown-100 font-body">{Math.round(pet.health)}/100</span>
            </div>
            <Bar value={pet.health} color={pet.health >= 60 ? 'bg-jade-500' : pet.health >= 30 ? 'bg-gold-500' : 'bg-red-500'} />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-clay-400 font-body">⚡ 能量</span>
              <span className="text-brown-100 font-body">{Math.round(pet.energy)}/100</span>
            </div>
            <Bar value={pet.energy} color="bg-cosmos-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-clay-400 font-body">{mood.emoji} 心情</span>
              <span className={`${mood.cls} font-body`}>{mood.label}</span>
            </div>
            <Bar value={typeof pet.mood === 'number' ? pet.mood : 50} color="bg-gold-400" />
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-clay-400 font-body">🔮 灵力</span>
              <span className="text-jade-300 font-body">{Math.round(pet.spiritual_power)}</span>
            </div>
            <Bar value={Math.min(100, pet.spiritual_power / 10)} color="bg-jade-400" />
          </div>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="bg-clay-900/80 p-2 border-2 border-clay-700">
            <div className="text-clay-400 text-[10px] uppercase tracking-wider font-body">当前区域</div>
            <div className="text-brown-100 text-sm font-display mt-0.5 shadow-solid">{regionName}</div>
          </div>
          <div className="bg-clay-900/80 p-2 border-2 border-clay-700">
            <div className="text-clay-400 text-[10px] uppercase tracking-wider font-body">境界</div>
            <div className="text-gold-300 text-sm font-display mt-0.5 shadow-solid">炼气 {pet.cultivation_level} 层</div>
          </div>
        </div>

        <div className="mt-3">
          <button
            onClick={handleSwitch}
            disabled={isDead || switching}
            className={`w-full py-2 font-display text-sm tracking-wider uppercase transition-all ${
              isDead
                ? 'bg-clay-900/50 text-clay-600 cursor-not-allowed border-2 border-clay-800'
                : isPlayer
                ? 'game-button bg-gradient-to-b from-orange-600 to-orange-800 border-2 border-orange-500'
                : 'game-button bg-gradient-to-b from-clay-600 to-clay-800 border-2 border-clay-500'
            }`}
          >
            {switching ? '切换中...' : isDead ? '已逝' : isPlayer ? '切换 AI 漫游' : '接管控制'}
          </button>
          {switchError && (
            <div className="mt-1 text-xs text-red-400 text-center font-body">{switchError}</div>
          )}
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-body">
            <span className={`w-2 h-2 ${wsConnected ? 'bg-jade-400' : 'bg-red-400'}`} />
            <span className="text-clay-400">{wsConnected ? '实时同步中' : '连接断开'}</span>
          </div>
        </div>
      </div>

      <div className="pixel-card p-4 flex-1 overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-sm text-brown-200 shadow-solid">🗺️ 探索记录</h3>
          <span className="text-xs text-clay-500 font-body">{events.length} 条记录</span>
        </div>
        <div className="flex-1 overflow-y-auto pr-1">
          {events.length > 0 ? (
            events.map((event) => (
              <EventItem key={event.id} event={event} />
            ))
          ) : (
            <div className="text-center py-8 text-clay-500">
              <div className="text-3xl mb-2 opacity-30">🌿</div>
              <div className="text-xs">暂无探索记录</div>
              <div className="text-xs mt-1">切换到 AI 漫游模式开始探索</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
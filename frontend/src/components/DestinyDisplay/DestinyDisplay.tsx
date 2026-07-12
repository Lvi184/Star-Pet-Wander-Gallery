import { useState, useEffect } from 'react';
import api from '../../services/api';

interface FateInfo {
  current_region: string;
  current_region_fate: string;
  all_fates: Record<string, string>;
  visible_to_player: boolean;
  visible_to_planner: boolean;
}

interface DestinyDisplayProps {
  charId: string;
}

const regionNames: Record<string, string> = {
  qingqiu: '青丘',
  kunlun: '昆仑',
  donghai: '东海',
  lingxu: '灵墟',
  youdu: '幽都',
  xinghai: '星海'
};

const fateColors: Record<string, string> = {
  normal: 'bg-green-500',
  lucky: 'bg-yellow-400',
  dangerous: 'bg-orange-500',
  disaster: 'bg-red-500'
};

const fateIcons: Record<string, string> = {
  normal: '😊',
  lucky: '✨',
  dangerous: '⚠️',
  disaster: '💀'
};

const fateDescriptions: Record<string, string> = {
  normal: '平静的一天',
  lucky: '好运降临',
  dangerous: '危险潜伏',
  disaster: '灾难将至'
};

export default function DestinyDisplay({ charId }: DestinyDisplayProps) {
  const [fateInfo, setFateInfo] = useState<FateInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFateInfo();
  }, [charId]);

  const fetchFateInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/character/${charId}/destiny`);
      setFateInfo(response.data);
    } catch (error) {
      console.error('Failed to fetch destiny:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
        <div className="text-center text-slate-400">加载中...</div>
      </div>
    );
  }

  if (!fateInfo) {
    return null;
  }

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-yellow-400">🔮 天道命运</h3>
        <button
          onClick={fetchFateInfo}
          className="text-sm text-slate-400 hover:text-white"
        >
          刷新
        </button>
      </div>

      <div className="bg-slate-700 rounded-lg p-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-full ${fateColors[fateInfo.current_region_fate]} flex items-center justify-center text-2xl`}>
            {fateIcons[fateInfo.current_region_fate]}
          </div>
          <div>
            <div className="text-slate-400 text-sm">当前区域</div>
            <div className="text-white font-semibold">
              {regionNames[fateInfo.current_region] || fateInfo.current_region}
            </div>
            <div className="text-sm" style={{ color: fateInfo.current_region_fate === 'normal' ? '#22c55e' : fateInfo.current_region_fate === 'lucky' ? '#facc15' : fateInfo.current_region_fate === 'dangerous' ? '#f97316' : '#ef4444' }}>
              {fateDescriptions[fateInfo.current_region_fate]}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-slate-400 text-sm mb-2">六域命运一览</div>
        {Object.entries(fateInfo.all_fates).map(([regionId, fate]) => (
          <div
            key={regionId}
            className="flex items-center justify-between bg-slate-700 rounded-lg p-2"
          >
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${fateColors[fate]}`}></span>
              <span className="text-white">{regionNames[regionId] || regionId}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">{fateIcons[fate]}</span>
              <span className="text-slate-400 text-sm">{fateDescriptions[fate]}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-slate-700">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-slate-400">玩家可见命运</div>
            <div className="text-green-400">{fateInfo.visible_to_player ? '是' : '否'}</div>
          </div>
          <div>
            <div className="text-slate-400">AI可见命运</div>
            <div className="text-red-400">{fateInfo.visible_to_planner ? '是' : '否'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
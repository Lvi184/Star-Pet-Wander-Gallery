import { useState, useEffect } from 'react';
import { useGameStore } from '../../game/zustand/store';
import { REGION_NAMES, FATE_NAMES, FATE_COLORS } from '../../game/constants';
import { RegionId, WorldLineEvent } from '../../game/zustand/types';
import { worldlineApi } from '../../services/api';

export default function WorldlineDrawer() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const worldLineEvents = useGameStore((state: any) => state.worldLine.events) as WorldLineEvent[];
  const currentRegion = useGameStore((state: any) => state.world.currentRegion) as RegionId;
  const fateLevel = useGameStore((state: any) => state.world.fateLevel) as string;
  const day = useGameStore((state: any) => state.world.day) as number;

  const sortedEvents = [...worldLineEvents].sort((a, b) => b.timestamp - a.timestamp);
  const days = [...new Set(sortedEvents.map((e) => e.day))].sort((a, b) => b - a);

  const getEventsByDay = (dayNum: number) => {
    return sortedEvents.filter((e) => e.day === dayNum);
  };

  const getRegionInfo = (regionId: RegionId) => {
    return {
      name: REGION_NAMES[regionId] || regionId,
    };
  };

  useEffect(() => {
    const loadWorldline = async () => {
      setLoading(true);
      try {
        await worldlineApi.getHistory('player');
      } catch {
      } finally {
        setLoading(false);
      }
    };
    loadWorldline();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-cosmos-400 text-sm">加载中...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-cosmos-900/60 rounded-lg p-3 border border-cosmos-800/50">
          <div className="text-xs text-cosmos-400 mb-1">当前区域</div>
          <div className="text-sm text-white">{getRegionInfo(currentRegion).name}</div>
        </div>
        <div className="bg-cosmos-900/60 rounded-lg p-3 border border-cosmos-800/50">
          <div className="text-xs text-cosmos-400 mb-1">今日命运</div>
          <div className="text-sm font-medium" style={{ color: FATE_COLORS[fateLevel] }}>
            {FATE_NAMES[fateLevel]}
          </div>
        </div>
        <div className="bg-cosmos-900/60 rounded-lg p-3 border border-cosmos-800/50">
          <div className="text-xs text-cosmos-400 mb-1">生存天数</div>
          <div className="text-lg text-gold-400 font-semibold">{day}</div>
        </div>
        <div className="bg-cosmos-900/60 rounded-lg p-3 border border-cosmos-800/50">
          <div className="text-xs text-cosmos-400 mb-1">总事件数</div>
          <div className="text-lg text-cosmos-300 font-semibold">{sortedEvents.length}</div>
        </div>
      </div>

      <div className="bg-cosmos-900/40 rounded-lg border border-cosmos-800/50">
        <div className="px-3 py-2 border-b border-cosmos-800/50">
          <h3 className="text-sm font-semibold text-cosmos-200">📅 时间线</h3>
        </div>
        <div className="max-h-40 overflow-y-auto">
          {days.length > 0 ? (
            <div className="p-2 space-y-1">
              {days.map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => setSelectedDay(selectedDay === dayNum ? null : dayNum)}
                  className={`w-full p-2 rounded text-left text-xs transition-all ${
                    selectedDay === dayNum
                      ? 'bg-cosmos-700/50 text-cosmos-100'
                      : 'text-cosmos-400 hover:bg-cosmos-800/50'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span>第 {dayNum} 天</span>
                    <span className="text-[10px] bg-cosmos-900/60 px-1.5 py-0.5 rounded-full border border-cosmos-800/50">
                      {getEventsByDay(dayNum).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="px-3 py-6 text-center text-xs text-cosmos-500">暂无事件记录</div>
          )}
        </div>
      </div>

      <div className="bg-cosmos-900/40 rounded-lg border border-cosmos-800/50">
        <div className="px-3 py-2 border-b border-cosmos-800/50">
          <h3 className="text-sm font-semibold text-cosmos-200">📜 事件记录</h3>
        </div>
        <div className="max-h-60 overflow-y-auto">
          {selectedDay ? (
            <div className="p-2 space-y-2">
              {getEventsByDay(selectedDay).map((event) => (
                <div
                  key={event.id}
                  className="p-2 rounded bg-cosmos-800/40 border border-cosmos-700/50"
                >
                  <div className="text-sm text-cosmos-100 mb-1">{event.event}</div>
                  <div className="flex items-center gap-2 text-[10px] text-cosmos-400">
                    <span>📍 {getRegionInfo(event.region as RegionId).name}</span>
                    <span>第 {event.day} 天</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4">
              <div className="text-xs text-cosmos-500 mb-3">选择一天查看详细事件</div>
              <div className="space-y-2">
                {sortedEvents.slice(0, 5).map((event) => (
                  <div
                    key={event.id}
                    className="p-2 rounded bg-cosmos-800/30 border border-cosmos-700/30"
                  >
                    <div className="text-xs text-cosmos-200">{event.event}</div>
                    <div className="text-[10px] text-cosmos-500 mt-0.5">
                      第 {event.day} 天 · {getRegionInfo(event.region as RegionId).name}
                    </div>
                  </div>
                ))}
                {sortedEvents.length === 0 && (
                  <div className="text-center text-xs text-cosmos-500 py-4">暂无事件</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

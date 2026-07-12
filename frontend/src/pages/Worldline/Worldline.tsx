import { useState, useEffect } from 'react';
import { useGameStore } from '../../game/zustand/store';
import { REGION_NAMES, REGION_DESCRIPTIONS, FATE_NAMES, FATE_COLORS } from '../../game/constants';
import { RegionId } from '../../game/zustand/types';
import { characterApi, worldlineApi } from '../../services/api';

const Worldline = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRewindPanel, setShowRewindPanel] = useState(false);

  const worldLineEvents = useGameStore((state) => state.worldLine.events);
  const currentRegion = useGameStore((state) => state.world.currentRegion);
  const fateLevel = useGameStore((state) => state.world.fateLevel);
  const day = useGameStore((state) => state.world.day);

  const sortedEvents = [...worldLineEvents].sort((a, b) => b.timestamp - a.timestamp);

  const days = [...new Set(sortedEvents.map((e) => e.day))].sort((a, b) => b - a);

  const getEventsByDay = (dayNum: number) => {
    return sortedEvents.filter((e) => e.day === dayNum);
  };

  const getRegionInfo = (regionId: RegionId) => {
    return {
      name: REGION_NAMES[regionId] || regionId,
      description: REGION_DESCRIPTIONS[regionId] || '',
    };
  };

  useEffect(() => {
    const loadWorldline = async () => {
      setLoading(true);
      try {
        const response = await worldlineApi.getHistory('player');
        if (response.data) {
          console.log('Worldline data:', response.data);
        }
      } catch (error) {
        console.error('Failed to load worldline:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorldline();
  }, []);

  const handleRewind = async () => {
    if (!selectedDay) return;
    setLoading(true);
    try {
      await characterApi.rewind('player');
      setShowRewindPanel(false);
      setSelectedDay(null);
    } catch (error) {
      console.error('Rewind failed:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg">
        <div className="text-accent font-display text-xl">加载中...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg p-6">
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl text-accent glow-text mb-2">🌌 世界线演化</h1>
            <p className="text-muted font-body">记录你与灵兽共同经历的每一刻</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-2 bg-clay-700/50 rounded border-2 border-accent/30">
              <span className="text-xs text-muted font-body">今日命运</span>
              <span 
                className="font-display text-white px-3 py-1 rounded"
                style={{ backgroundColor: FATE_COLORS[fateLevel] }}
              >
                {FATE_NAMES[fateLevel]}
              </span>
            </div>
            <button
              onClick={() => setShowRewindPanel(true)}
              className="game-button px-6 py-2"
            >
              ⏪ 天道回溯
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1">
          <div className="bg-bg2/80 border-4 border-clay-700 rounded-lg p-4">
            <h2 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
              📅 时间线
            </h2>
            <div className="space-y-2">
              {days.length > 0 ? (
                days.map((dayNum) => (
                  <button
                    key={dayNum}
                    onClick={() => setSelectedDay(dayNum)}
                    className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                      selectedDay === dayNum
                        ? 'bg-accent/20 border-accent text-accent'
                        : 'bg-bg border-clay-600 hover:border-accent text-ink'
                    }`}
                  >
                    <div className="font-display text-sm">第 {dayNum} 天</div>
                    <div className="text-xs text-muted font-body">
                      {getEventsByDay(dayNum).length} 个事件
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-muted text-center py-8">暂无事件记录</div>
              )}
            </div>
          </div>

          <div className="mt-6 bg-bg2/80 border-4 border-clay-700 rounded-lg p-4">
            <h2 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
              🗺️ 当前区域
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/20 rounded-lg flex items-center justify-center">
                  <span className="text-2xl">📍</span>
                </div>
                <div>
                  <div className="font-display text-white">{getRegionInfo(currentRegion).name}</div>
                  <div className="text-xs text-muted font-body">{getRegionInfo(currentRegion).description}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-bg p-3 rounded border-2 border-clay-600">
                  <div className="text-xs text-muted font-body">天数</div>
                  <div className="font-display text-xl text-accent">{day}</div>
                </div>
                <div className="bg-bg p-3 rounded border-2 border-clay-600">
                  <div className="text-xs text-muted font-body">命运</div>
                  <div 
                    className="font-display text-xl"
                    style={{ color: FATE_COLORS[fateLevel] }}
                  >
                    {FATE_NAMES[fateLevel]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-2">
          <div className="bg-bg2/80 border-4 border-clay-700 rounded-lg p-4">
            <h2 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
              📜 事件记录
            </h2>
            {selectedDay ? (
              <div className="space-y-4">
                {getEventsByDay(selectedDay).map((event) => (
                  <div
                    key={event.id}
                    className="bg-bg p-4 rounded-lg border-2 border-clay-600 hover:border-accent transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-display text-white mb-1">{event.event}</div>
                        <div className="flex items-center gap-4 text-xs text-muted font-body">
                          <span>📍 {getRegionInfo(event.region as RegionId).name}</span>
                          <span>👤 {event.character}</span>
                          <span>📅 第 {event.day} 天</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📖</div>
                <div className="text-muted font-body">选择一天查看详细事件</div>
              </div>
            )}
          </div>

          {!selectedDay && (
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-bg2/80 border-4 border-clay-700 rounded-lg p-4">
                <h3 className="font-display text-sm text-accent mb-3">🔥 最近事件</h3>
                <div className="space-y-2">
                  {sortedEvents.slice(0, 5).map((event) => (
                    <div
                      key={event.id}
                      className="bg-bg p-2 rounded border border-clay-600"
                    >
                      <div className="text-xs text-white">{event.event}</div>
                      <div className="text-xs text-muted font-body">
                        第 {event.day} 天 · {getRegionInfo(event.region as RegionId).name}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-bg2/80 border-4 border-clay-700 rounded-lg p-4">
                <h3 className="font-display text-sm text-accent mb-3">📊 统计数据</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted font-body">总事件数</span>
                    <span className="font-display text-xl text-accent">{sortedEvents.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted font-body">探索区域</span>
                    <span className="font-display text-xl text-accent">
                      {new Set(sortedEvents.map((e) => e.region)).size}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted font-body">生存天数</span>
                    <span className="font-display text-xl text-accent">{day}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRewindPanel && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-bg2 border-4 border-accent rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="font-display text-xl text-accent mb-4">⏪ 天道回溯</h3>
            <p className="text-muted font-body mb-4">
              回溯到过去的时间点，重新体验不同的命运选择。
              注意：回溯会改变当前时间线。
            </p>
            <div className="space-y-3 mb-6">
              {days.slice(0, 5).map((dayNum) => (
                <button
                  key={dayNum}
                  onClick={() => {
                    setSelectedDay(dayNum);
                  }}
                  className={`w-full p-3 rounded-lg border-2 transition-all text-left ${
                    selectedDay === dayNum
                      ? 'bg-accent/20 border-accent text-accent'
                      : 'bg-bg border-clay-600 hover:border-accent text-ink'
                  }`}
                >
                  <div className="font-display">回溯到第 {dayNum} 天</div>
                  <div className="text-xs text-muted font-body">
                    {getEventsByDay(dayNum).length} 个事件将被重置
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowRewindPanel(false)}
                className="flex-1 px-4 py-2 bg-clay-700 text-white rounded border-2 border-clay-600 hover:border-accent transition-all"
              >
                取消
              </button>
              <button
                onClick={handleRewind}
                disabled={!selectedDay || loading}
                className="flex-1 game-button px-4 py-2 disabled:opacity-50"
              >
                {loading ? '回溯中...' : '确认回溯'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Worldline;

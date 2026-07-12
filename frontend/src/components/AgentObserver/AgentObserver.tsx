import { useState, useEffect } from 'react';
import api from '../../services/api';

interface ActionIntent {
  action_type: string;
  target?: string;
  reason: string;
  risk_tolerance: number;
}

interface EventRecord {
  id: string;
  action_type: string;
  location: string;
  detail: string;
  cause_chain: string[];
  timestamp: string;
}

interface AgentObserverProps {
  charId: string;
}

export default function AgentObserver({ charId }: AgentObserverProps) {
  const [actionIntent, setActionIntent] = useState<ActionIntent | null>(null);
  const [recentEvents, setRecentEvents] = useState<EventRecord[]>([]);
  const [isObserving, setIsObserving] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  useEffect(() => {
    if (isObserving && charId) {
      const interval = setInterval(() => {
        fetchRecentEvents();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isObserving, charId]);

  const fetchRecentEvents = async () => {
    try {
      const response = await api.get(`/character/${charId}/events`);
      setRecentEvents(response.data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const runAITurn = async () => {
    try {
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI开始决策...`]);
      
      const response = await api.post(`/character/${charId}/ai-turn`);
      if (response.data.success) {
        const event = response.data.event_record;
        setActionIntent({
          action_type: event?.action_type || '',
          target: event?.location || '',
          reason: 'AI自主决策',
          risk_tolerance: 0.5
        });
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI选择: ${event?.action_type}`]);
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 位置: ${event?.location}`]);
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 原因链: ${event?.cause_chain?.join(', ') || '无'}`]);
        await fetchRecentEvents();
      }
    } catch (error: any) {
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 错误: ${error.response?.data?.detail || error.message}`]);
    }
  };

  const getFateInfo = async () => {
    try {
      const response = await api.get(`/character/${charId}/destiny`);
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 当前区域命运: ${response.data.current_region_fate}`]);
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] AI可见命运: ${response.data.visible_to_planner ? '是' : '否'}`]);
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] 所有区域命运: ${JSON.stringify(response.data.all_fates)}`]);
    } catch (error) {
      console.error('Failed to fetch destiny:', error);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-cyan-400">🎯 Agent观察台</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsObserving(!isObserving)}
            className={`px-3 py-1 rounded-full text-sm ${isObserving ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          >
            {isObserving ? '停止监控' : '开始监控'}
          </button>
          <button
            onClick={runAITurn}
            className="px-3 py-1 rounded-full text-sm bg-purple-500 text-white hover:bg-purple-600"
          >
            执行AI回合
          </button>
          <button
            onClick={getFateInfo}
            className="px-3 py-1 rounded-full text-sm bg-yellow-500 text-white hover:bg-yellow-600"
          >
            查看命运
          </button>
        </div>
      </div>

      {actionIntent && (
        <div className="bg-slate-700 rounded-lg p-3 mb-4">
          <h4 className="text-cyan-300 font-semibold mb-2">📋 Planner意图</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="text-slate-400">动作类型:</div>
            <div className="text-white">{actionIntent.action_type}</div>
            <div className="text-slate-400">目标:</div>
            <div className="text-white">{actionIntent.target || '无'}</div>
            <div className="text-slate-400">原因:</div>
            <div className="text-white">{actionIntent.reason}</div>
            <div className="text-slate-400">风险容忍度:</div>
            <div className="text-white">{actionIntent.risk_tolerance}</div>
          </div>
        </div>
      )}

      <div className="bg-slate-700 rounded-lg p-3 mb-4">
        <h4 className="text-cyan-300 font-semibold mb-2">📝 决策日志</h4>
        <div className="h-32 overflow-y-auto text-sm space-y-1">
          {log.map((entry, index) => (
            <div key={index} className="text-slate-300">{entry}</div>
          ))}
          {log.length === 0 && (
            <div className="text-slate-500">点击"执行AI回合"开始观察...</div>
          )}
        </div>
      </div>

      <div className="bg-slate-700 rounded-lg p-3">
        <h4 className="text-cyan-300 font-semibold mb-2">📊 最近事件记录</h4>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {recentEvents.map((event) => (
            <div key={event.id} className="bg-slate-800 rounded p-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-400">{event.action_type}</span>
                <span className="text-slate-500">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="text-slate-300">{event.location}</div>
              {event.cause_chain && event.cause_chain.length > 0 && (
                <div className="text-yellow-400 text-xs mt-1">
                  原因链: {event.cause_chain.join(', ')}
                </div>
              )}
            </div>
          ))}
          {recentEvents.length === 0 && (
            <div className="text-slate-500">暂无事件记录</div>
          )}
        </div>
      </div>
    </div>
  );
}
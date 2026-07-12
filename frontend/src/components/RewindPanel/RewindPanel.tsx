import { useState, useEffect } from 'react';
import api from '../../services/api';

interface Checkpoint {
  id: string;
  char_id: string;
  timestamp: string;
  snapshot: Record<string, any>;
  worldline_id: string;
}

interface WorldlineBranch {
  id: string;
  char_id: string;
  parent_id: string | null;
  created_at: string;
  description: string;
  is_active: boolean;
}

interface RewindPanelProps {
  charId: string;
}

export default function RewindPanel({ charId }: RewindPanelProps) {
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [worldlines, setWorldlines] = useState<WorldlineBranch[]>([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState<string | null>(null);
  const [isRewinding, setIsRewinding] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (charId) {
      fetchCheckpoints();
      fetchWorldlines();
    }
  }, [charId]);

  const fetchCheckpoints = async () => {
    try {
      const response = await api.get(`/character/${charId}/checkpoints`);
      setCheckpoints(response.data);
    } catch (error) {
      console.error('Failed to fetch checkpoints:', error);
    }
  };

  const fetchWorldlines = async () => {
    try {
      const response = await api.get(`/character/${charId}/worldline`);
      setWorldlines(response.data);
    } catch (error) {
      console.error('Failed to fetch worldlines:', error);
    }
  };

  const handleRewind = async () => {
    if (!selectedCheckpoint) {
      setMessage('请先选择一个时间节点');
      return;
    }

    try {
      setIsRewinding(true);
      setMessage('正在回溯时间...');
      
      const response = await api.post(`/character/${charId}/rewind`, {
        checkpoint_id: selectedCheckpoint
      });
      
      if (response.data.success) {
        setMessage('✅ 时间回溯成功！');
        setSelectedCheckpoint(null);
        await fetchCheckpoints();
        await fetchWorldlines();
      } else {
        setMessage('❌ ' + response.data.message);
      }
    } catch (error: any) {
      setMessage('❌ ' + (error.response?.data?.detail || error.message));
    } finally {
      setIsRewinding(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-400">⏪ 天道回溯</h3>
        <button
          onClick={handleRewind}
          disabled={isRewinding || !selectedCheckpoint}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${isRewinding || !selectedCheckpoint ? 'bg-slate-600 text-slate-400 cursor-not-allowed' : 'bg-purple-500 text-white hover:bg-purple-600'}`}
        >
          {isRewinding ? '回溯中...' : '执行回溯'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${message.includes('成功') ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
          {message}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-cyan-300 font-semibold mb-2">📌 时间节点</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {checkpoints.map((checkpoint) => (
              <div
                key={checkpoint.id}
                onClick={() => setSelectedCheckpoint(checkpoint.id)}
                className={`p-3 rounded-lg cursor-pointer transition-all ${selectedCheckpoint === checkpoint.id ? 'bg-purple-600 border border-purple-400' : 'bg-slate-700 hover:bg-slate-600'}`}
              >
                <div className="text-white font-semibold">{formatTime(checkpoint.timestamp)}</div>
                <div className="text-slate-400 text-sm">
                  生命: {checkpoint.snapshot.health?.toFixed(0) || '-'} | 
                  能量: {checkpoint.snapshot.energy?.toFixed(0) || '-'} | 
                  心情: {checkpoint.snapshot.mood?.toFixed(0) || '-'}
                </div>
                <div className="text-slate-500 text-xs">
                  {checkpoint.snapshot.current_region || '未知区域'}
                </div>
              </div>
            ))}
            {checkpoints.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-4">暂无时间节点</div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-cyan-300 font-semibold mb-2">🌌 世界线分支</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {worldlines.map((worldline) => (
              <div
                key={worldline.id}
                className={`p-3 rounded-lg ${worldline.is_active ? 'bg-green-900 border border-green-500' : 'bg-slate-700'}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{worldline.is_active ? '🌟' : '💫'}</span>
                  <span className="text-white font-semibold">
                    {worldline.is_active ? '当前世界线' : '命运回响'}
                  </span>
                </div>
                <div className="text-slate-400 text-sm mt-1">{worldline.description}</div>
                <div className="text-slate-500 text-xs">
                  {formatTime(worldline.created_at)}
                </div>
              </div>
            ))}
            {worldlines.length === 0 && (
              <div className="text-slate-500 text-sm text-center py-4">暂无世界线分支</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
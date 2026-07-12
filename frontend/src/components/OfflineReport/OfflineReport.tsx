import React from 'react'

interface OfflineEvent {
  event_type: string
  location: string
  detail: string
  mood_change: number
  energy_change: number
  items_found: string[]
}

interface OfflineReportProps {
  offlineDuration: number
  events: OfflineEvent[]
  currentStatus: {
    mood: number
    energy: number
    location: string
    inventory: string[]
  }
  onClose: () => void
}

const eventIcons: Record<string, string> = {
  'explore': '🗺️',
  'discover': '✨',
  'rest': '😴',
  'collect': '🎁',
  'social': '👥',
  'move': '🚶',
}

const regionNames: Record<string, string> = {
  'star-forest': '星光森林',
  'moon-lake': '月牙湖',
  'crater': '陨石坑',
  'crystal-cave': '水晶洞窟',
  'cloud-peaks': '云巅峰',
  'abyss': '深渊裂谷',
}

const OfflineReport: React.FC<OfflineReportProps> = ({ 
  offlineDuration, 
  events, 
  currentStatus,
  onClose 
}) => {
  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时`
    return `${Math.floor(seconds / 86400)}天${Math.floor((seconds % 86400) / 3600)}小时`
  }

  const totalMoodChange = events.reduce((sum, e) => sum + e.mood_change, 0)
  const totalEnergyChange = events.reduce((sum, e) => sum + e.energy_change, 0)
  const allItems = events.flatMap(e => e.items_found)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-bg2 rounded-2xl border border-accent max-w-md w-full max-h-[80vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-accent/20 to-primary/20 p-4 rounded-t-2xl border-b border-rule">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-accent">🌙 离线报告</h2>
              <p className="text-xs text-muted">你离开了 {formatDuration(offlineDuration)}</p>
            </div>
            <button
              className="text-muted hover:text-primary transition-colors text-xl"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-bg1 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">📊</div>
              <div className="text-sm font-medium text-primary">{events.length}个事件</div>
            </div>
            <div className="bg-bg1 rounded-lg p-3 text-center">
              <div className="text-2xl mb-1">🎁</div>
              <div className="text-sm font-medium text-accent">{allItems.length}个物品</div>
            </div>
          </div>

          <div className="bg-bg1 rounded-lg p-3 space-y-2">
            <h3 className="text-xs font-semibold text-muted">状态变化</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">心情</span>
              <span className={`text-xs font-medium ${totalMoodChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalMoodChange >= 0 ? '+' : ''}{totalMoodChange} → {currentStatus.mood}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">精力</span>
              <span className={`text-xs font-medium ${totalEnergyChange >= 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                {totalEnergyChange >= 0 ? '+' : ''}{totalEnergyChange} → {currentStatus.energy}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted">当前位置</span>
              <span className="text-xs font-medium text-primary">
                {regionNames[currentStatus.location] || currentStatus.location}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-muted mb-2">事件回顾</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {events.map((event, idx) => (
                <div key={idx} className="flex items-start gap-2 p-2 bg-bg1 rounded-lg">
                  <span className="text-sm">{eventIcons[event.event_type] || '📌'}</span>
                  <div className="flex-1">
                    <p className="text-xs text-primary">{event.detail}</p>
                    {event.items_found && event.items_found.length > 0 && (
                      <span className="text-xs text-accent">获得: {event.items_found.join('、')}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {allItems.length > 0 && (
            <div className="bg-accent/10 rounded-lg p-3">
              <h3 className="text-xs font-semibold text-accent mb-2">🏆 获得物品</h3>
              <div className="flex flex-wrap gap-2">
                {allItems.map((item, idx) => (
                  <span key={idx} className="text-xs bg-bg1 px-2 py-1 rounded-full text-primary">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            className="w-full py-3 bg-gradient-to-r from-accent to-primary text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
            onClick={onClose}
          >
            知道了
          </button>
        </div>
      </div>
    </div>
  )
}

export default OfflineReport
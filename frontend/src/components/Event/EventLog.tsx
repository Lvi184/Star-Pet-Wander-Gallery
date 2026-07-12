import React from 'react'

interface PetEvent {
  id: string
  event_type: string
  location: string
  detail: string
  timestamp: string
  mood_change: number
  energy_change: number
  items_found: string[]
}

interface EventLogProps {
  events: PetEvent[]
  onEventClick?: (event: PetEvent) => void
}

const eventIcons: Record<string, string> = {
  'explore': '🗺️',
  'discover': '✨',
  'rest': '😴',
  'collect': '🎁',
  'social': '👥',
  'move': '🚶',
  'meet': '🤝',
  'find': '🔍',
  'exchange': '🔄',
}

const regionNames: Record<string, string> = {
  'star-forest': '星光森林',
  'moon-lake': '月牙湖',
  'crater': '陨石坑',
  'crystal-cave': '水晶洞窟',
  'cloud-peaks': '云巅峰',
  'abyss': '深渊裂谷',
}

const EventLog: React.FC<EventLogProps> = ({ events, onEventClick }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    if (diff < 60000) return '刚刚'
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="bg-bg2 rounded-xl p-4 border border-rule">
      <h3 className="text-sm font-semibold text-accent mb-3">📜 近期事件</h3>
      
      {events.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted">
          暂无事件记录
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {events.map((event) => (
            <div
              key={event.id}
              className="flex items-start gap-3 p-2 rounded-lg bg-bg1 hover:bg-bg0 cursor-pointer transition-colors"
              onClick={() => onEventClick?.(event)}
            >
              <span className="text-lg flex-shrink-0">
                {eventIcons[event.event_type] || '📌'}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-primary truncate">{event.detail}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-muted">
                    📍 {regionNames[event.location] || event.location}
                  </span>
                  <span className="text-xs text-muted">
                    {formatTime(event.timestamp)}
                  </span>
                </div>
                {event.mood_change !== 0 && (
                  <span className={`text-xs ml-1 ${event.mood_change > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    心情 {event.mood_change > 0 ? '+' : ''}{event.mood_change}
                  </span>
                )}
                {event.energy_change !== 0 && (
                  <span className={`text-xs ml-1 ${event.energy_change > 0 ? 'text-blue-500' : 'text-orange-500'}`}>
                    精力 {event.energy_change > 0 ? '+' : ''}{event.energy_change}
                  </span>
                )}
                {event.items_found && event.items_found.length > 0 && (
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    <span className="text-xs text-muted">获得:</span>
                    {event.items_found.map((item, idx) => (
                      <span key={idx} className="text-xs text-accent">
                        {item}{idx < event.items_found.length - 1 ? '、' : ''}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventLog
import React from 'react'

interface StatusPanelProps {
  mood: number
  energy: number
  location: string
  currentAction: string
}

const regionNames: Record<string, string> = {
  'star-forest': '星光森林',
  'moon-lake': '月牙湖',
  'crater': '陨石坑',
  'crystal-cave': '水晶洞窟',
  'cloud-peaks': '云巅峰',
  'abyss': '深渊裂谷',
}

const actionNames: Record<string, string> = {
  'explore': '探索中',
  'rest': '休息中',
  'collect': '收集中',
  'social': '社交中',
  'discover': '发现中',
  'move': '移动中',
}

const StatusPanel: React.FC<StatusPanelProps> = ({ mood, energy, location, currentAction }) => {
  const getMoodColor = () => {
    if (mood > 70) return 'bg-gradient-to-r from-green-500 to-green-400'
    if (mood > 40) return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    return 'bg-gradient-to-r from-red-500 to-red-400'
  }

  const getEnergyColor = () => {
    if (energy > 60) return 'bg-gradient-to-r from-blue-500 to-blue-400'
    if (energy > 30) return 'bg-gradient-to-r from-yellow-500 to-yellow-400'
    return 'bg-gradient-to-r from-orange-500 to-orange-400'
  }

  const getMoodIcon = () => {
    if (mood > 80) return '🌟'
    if (mood > 60) return '😊'
    if (mood > 40) return '😐'
    if (mood > 20) return '😿'
    return '😫'
  }

  const getEnergyIcon = () => {
    if (energy > 60) return '⚡'
    if (energy > 30) return '🔋'
    return '😴'
  }

  return (
    <div className="pixel-card">
      <h3 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600">
        📊 宠物状态
      </h3>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted font-body flex items-center gap-2">
              <span className="text-lg">{getMoodIcon()}</span> 心情
            </span>
            <span className="text-sm font-display font-bold text-white">{Math.round(mood)}%</span>
          </div>
          <div className="progress-bar w-full h-3 rounded">
            <div
              className={`h-full ${getMoodColor()} transition-all duration-500 ease-out rounded`}
              style={{ width: `${mood}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted font-body flex items-center gap-2">
              <span className="text-lg">{getEnergyIcon()}</span> 精力
            </span>
            <span className="text-sm font-display font-bold text-white">{Math.round(energy)}%</span>
          </div>
          <div className="progress-bar w-full h-3 rounded">
            <div
              className={`h-full ${getEnergyColor()} transition-all duration-500 ease-out rounded`}
              style={{ width: `${energy}%` }}
            />
          </div>
        </div>

        <div className="pt-3 border-t-2 border-clay-600 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted font-body">📍 位置</span>
            <span className="text-sm font-display text-accent">
              {regionNames[location] || location}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted font-body">🎯 当前状态</span>
            <span className="text-sm font-display text-green-400">
              {actionNames[currentAction] || currentAction || '空闲'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default StatusPanel

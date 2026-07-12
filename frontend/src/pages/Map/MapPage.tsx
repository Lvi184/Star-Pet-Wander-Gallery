import { useState, useEffect } from 'react'
import api from '../../services/api'

const MapPage = () => {
  const [, setCharId] = useState('test-char')
  const [currentRegion, setCurrentRegion] = useState('star-forest')
  const [playerPosition, setPlayerPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    api.get('/character/test-char/status')
      .then(response => {
        if (response.data) {
          setCharId(response.data.id)
          setCurrentRegion(response.data.current_region || 'star-forest')
          setPlayerPosition({
            x: response.data.position_x || 480,
            y: response.data.position_y || 320
          })
        }
      })
      .catch(() => {
        setCharId('test-char')
      })
  }, [])

  const handleRegionEnter = (regionId: string) => {
    setCurrentRegion(regionId)
    console.log(`Entered region: ${regionId}`)
  }

  const regions = [
    { id: 'star-forest', name: '星光森林', bg: '/assets/game/images/background_forest.png', unlocked: true, description: '星光闪耀的神秘森林' },
    { id: 'moon-lake', name: '月牙湖', bg: '/assets/game/images/background_grass.png', unlocked: true, description: '宁静的月牙形湖泊' },
    { id: 'crater', name: '陨石坑', bg: '/assets/game/images/background_desert.png', unlocked: true, description: '神秘的陨石坠落之地' },
    { id: 'crystal-cave', name: '水晶洞窟', bg: '/assets/game/images/background_fall.png', unlocked: true, description: '五彩斑斓的水晶世界' },
    { id: 'cloud-peaks', name: '云巅峰', bg: '/assets/game/images/background_winter.png', unlocked: true, description: '云端之上的神秘山峰' },
    { id: 'abyss', name: '深渊裂谷', bg: '/assets/game/images/background_desert.png', unlocked: false, description: '未知的深渊领域' },
  ]

  const getStars = (count: number, max: number = 5) => {
    const stars = []
    for (let i = 0; i < max; i++) {
      stars.push(
        <div key={i} className={`star ${i < count ? 'filled' : 'empty'}`} />
      )
    }
    return stars
  }

  const getRegionProgress = (regionId: string) => {
    const progressMap: Record<string, number> = {
      'star-forest': 80,
      'moon-lake': 60,
      'crater': 40,
      'crystal-cave': 20,
      'cloud-peaks': 10,
      'abyss': 0,
    }
    return progressMap[regionId] || 0
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/game/images/a_button.png" alt="map" className="w-8 h-8 pixelated" />
          <h2 className="font-display text-2xl text-accent glow-text">星球地图</h2>
        </div>
        <div className="text-sm text-muted font-body">
          位置: ({playerPosition.x.toFixed(0)}, {playerPosition.y.toFixed(0)})
        </div>
      </div>

      <div className="pixel-frame bg-gradient-to-br from-clay-800 to-brown-800">
        <div className="p-6">
          <div className="relative rounded-lg overflow-hidden border-4 border-clay-600 aspect-video">
            <img 
              src={regions.find(r => r.id === currentRegion)?.bg} 
              alt={currentRegion}
              className="w-full h-full object-cover pixelated"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg2/60 to-transparent" />
            
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-display text-xl text-white glow-text">
                    {regions.find(r => r.id === currentRegion)?.name}
                  </h3>
                  <p className="text-sm text-white/70 font-body">
                    {regions.find(r => r.id === currentRegion)?.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-xs text-white/70 font-body mb-1">探索进度</div>
                  <div className="progress-bar w-32 h-3 rounded">
                    <div className="progress-bar-fill h-full rounded" style={{ width: `${getRegionProgress(currentRegion)}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4">
              <div className="bg-bg2/80 px-3 py-1 rounded-full border-2 border-accent">
                <span className="text-xs font-display text-accent">📍 当前位置</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {regions.map((region) => (
          <button
            key={region.id}
            onClick={() => region.unlocked && handleRegionEnter(region.id)}
            className={`map-tile relative overflow-hidden rounded-lg border-2 transition-all duration-300 ${
              region.id === currentRegion 
                ? 'border-accent ring-2 ring-accent/50' 
                : region.unlocked 
                  ? 'border-clay-600 hover:border-accent' 
                  : 'border-gray-700 opacity-60 cursor-not-allowed'
            }`}
          >
            <img 
              src={region.bg} 
              alt={region.name}
              className={`w-full h-full object-cover pixelated ${!region.unlocked ? 'grayscale' : ''}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-bg2/90 via-bg2/40 to-transparent" />
            
            {!region.unlocked && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl">🔒</span>
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-display text-sm text-white">{region.name}</h4>
                <div className="star-container">{getStars(Math.ceil(getRegionProgress(region.id) / 20))}</div>
              </div>
              <div className="progress-bar w-full h-2 rounded">
                <div className="progress-bar-fill h-full rounded" style={{ width: `${getRegionProgress(region.id)}%` }} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <div className="pixel-box">
        <div className="bg-clay-700 p-4">
          <h3 className="font-display text-lg text-white mb-3 text-center">🎮 操作提示</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-bg2 rounded-lg border-2 border-clay-600 flex items-center justify-center">
                <span className="font-display text-lg">W</span>
              </div>
              <span className="text-xs text-muted font-body">向上</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-bg2 rounded-lg border-2 border-clay-600 flex items-center justify-center">
                <span className="font-display text-lg">S</span>
              </div>
              <span className="text-xs text-muted font-body">向下</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-bg2 rounded-lg border-2 border-clay-600 flex items-center justify-center">
                <span className="font-display text-lg">A</span>
              </div>
              <span className="text-xs text-muted font-body">向左</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 bg-bg2 rounded-lg border-2 border-clay-600 flex items-center justify-center">
                <span className="font-display text-lg">D</span>
              </div>
              <span className="text-xs text-muted font-body">向右</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MapPage

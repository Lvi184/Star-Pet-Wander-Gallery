import React from 'react'
import { usePetStore } from '../../stores/petStore'
import { Link } from 'react-router-dom'

const Home: React.FC = () => {
  const pet = usePetStore()

  const regionNames: Record<string, string> = {
    'star-forest': '星光森林',
    'moon-lake': '月牙湖',
    'crater': '陨石坑',
    'crystal-cave': '水晶洞窟',
    'cloud-peaks': '云巅峰',
    'abyss': '深渊裂谷',
  }

  const getRegionBackground = () => {
    switch (pet.currentRegion) {
      case 'star-forest': return '/assets/game/images/background_forest.png'
      case 'moon-lake': return '/assets/game/images/background_grass.png'
      case 'crater': return '/assets/game/images/background_desert.png'
      case 'crystal-cave': return '/assets/game/images/background_fall.png'
      case 'cloud-peaks': return '/assets/game/images/background_winter.png'
      default: return '/assets/game/images/background_forest.png'
    }
  }

  const getPetSprite = () => {
    const sprites = [
      '/assets/game/atlases/generated/hero.png',
      '/assets/game/atlases/generated/npc_01.png',
      '/assets/game/atlases/generated/npc_02.png',
      '/assets/game/atlases/generated/npc_03.png',
      '/assets/game/atlases/generated/npc_04.png',
      '/assets/game/atlases/generated/npc_05.png',
    ]
    return sprites[Math.floor(Math.random() * sprites.length)]
  }

  return (
    <div className="space-y-6">
      <div className="relative rounded-2xl overflow-hidden pixel-frame">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url(${getRegionBackground()})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="relative bg-gradient-to-br from-clay-800/95 to-brown-800/95 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative">
              <div className={`w-28 h-28 rounded-full bg-gradient-to-br from-bg2 to-clay-700 border-4 ${pet.mood > 70 ? 'border-green-500' : pet.mood > 40 ? 'border-accent' : 'border-orange-500'} flex items-center justify-center overflow-hidden shadow-[0_0_30px_rgba(56,189,248,0.6)] animate-glow`}>
                <img 
                  src={getPetSprite()} 
                  alt={pet.name}
                  className="w-full h-full object-contain pixelated"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>
              {pet.energy > 60 && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse border-2 border-bg" />
              )}
              {pet.mood > 80 && (
                <div className="absolute -top-2 -left-2 text-lg animate-bounce">✨</div>
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h2 className="font-display text-3xl sm:text-4xl tracking-wider glow-text text-white">
                {pet.name}
                <span className="text-sm text-muted font-normal ml-2">({pet.species})</span>
              </h2>
              <p className="text-muted mt-2 text-sm font-body">
                📍 当前位置：{regionNames[pet.currentRegion || ''] || pet.currentRegion || '未知区域'}
              </p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-4">
                <span className="pixel-tag bg-green-500/20 text-green-400 border-green-500/40">
                  {pet.mood > 70 ? '😊' : pet.mood > 40 ? '😐' : '😿'} 心情 {Math.round(pet.mood)}%
                </span>
                <span className="pixel-tag bg-blue-500/20 text-blue-400 border-blue-500/40">
                  {pet.energy > 60 ? '⚡' : pet.energy > 30 ? '🔋' : '😴'} 体力 {Math.round(pet.energy)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="pixel-card">
          <h3 className="font-display text-lg text-accent mb-3 pb-2 border-b-2 border-clay-600 flex items-center gap-2">
            <span className="text-xl">🎲</span> 最近动态
          </h3>
          <div className="flex items-start gap-3">
            <img src="/assets/game/images/enemy_01.png" alt="event" className="w-8 h-8 pixelated flex-shrink-0" />
            <p className="text-sm text-ink font-body leading-relaxed">
              {pet.name}在{regionNames[pet.currentRegion || ''] || '星宠世界'}发现了一颗闪烁的星光石，心情变得很好。
            </p>
          </div>
        </div>

        <div className="pixel-card">
          <h3 className="font-display text-lg text-accent mb-3 pb-2 border-b-2 border-clay-600 flex items-center gap-2">
            <span className="text-xl">🎒</span> 背包物品
          </h3>
          <div className="flex flex-wrap gap-2">
            {pet.inventory.length > 0 ? (
              pet.inventory.map((item) => (
                <div key={item} className="flex items-center gap-1 pixel-tag bg-accent/20 text-accent border-accent/40">
                  <img src="/assets/game/images/key.png" alt="item" className="w-4 h-4 pixelated" />
                  <span>{item}</span>
                </div>
              ))
            ) : (
              <span className="text-xs text-muted">背包空空如也</span>
            )}
          </div>
        </div>

        <div className="pixel-card">
          <h3 className="font-display text-lg text-accent mb-3 pb-2 border-b-2 border-clay-600 flex items-center gap-2">
            <span className="text-xl">⏳</span> 离线进度
          </h3>
          <div className="progress-bar w-full h-4 rounded mt-2">
            <div className="progress-bar-fill h-full rounded" style={{ width: '65%' }} />
          </div>
          <p className="text-xs text-muted mt-2 font-body">
            预计 2 小时后完成本轮探险
          </p>
        </div>
      </div>

      <div className="pixel-card">
        <h3 className="font-display text-lg text-accent mb-4 pb-2 border-b-2 border-clay-600 flex items-center gap-2">
          <span className="text-xl">⚡</span> 快捷操作
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link to="/diary">
            <button className="pixel-button px-6 py-3 text-white font-display text-lg shadow-solid">
              <span className="flex items-center gap-2">
                <img src="/assets/game/images/crystal.png" alt="diary" className="w-5 h-5 pixelated" />
                查看日记
              </span>
            </button>
          </Link>
          <Link to="/map">
            <button className="pixel-button px-6 py-3 text-white font-display text-lg shadow-solid">
              <span className="flex items-center gap-2">
                <img src="/assets/game/images/a_button.png" alt="map" className="w-5 h-5 pixelated" />
                星球地图
              </span>
            </button>
          </Link>
          <Link to="/interact">
            <button className="pixel-button px-6 py-3 text-white font-display text-lg shadow-solid">
              <span className="flex items-center gap-2">
                <img src="/assets/game/images/b_button.png" alt="interact" className="w-5 h-5 pixelated" />
                互动
              </span>
            </button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="pixel-desc">
          <div className="bg-brown-700 p-4">
            <h3 className="font-display text-xl text-white mb-3 text-center flex items-center justify-center gap-2">
              <span className="text-2xl">📜</span> 今日漫游志
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-bg2/50 p-2 rounded">
                <span className="text-xs text-muted font-body">07:00</span>
                <span className="text-xs text-ink/80">小星从梦中醒来，今天阳光明媚，是个探险的好日子。</span>
              </div>
              <div className="flex items-center gap-2 bg-bg2/50 p-2 rounded">
                <span className="text-xs text-muted font-body">08:30</span>
                <span className="text-xs text-ink/80">在星光森林散步，发现了一朵发光的小花。</span>
              </div>
              <div className="flex items-center gap-2 bg-bg2/50 p-2 rounded">
                <span className="text-xs text-muted font-body">10:00</span>
                <span className="text-xs text-ink/80">遇到了一只可爱的蝴蝶精灵。</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pixel-chats">
          <div className="bg-clay-700 p-4">
            <h3 className="font-display text-xl text-white mb-3 text-center flex items-center justify-center gap-2">
              <span className="text-2xl">🔔</span> 最新通知
            </h3>
            <div className="space-y-3">
              <div className="bg-bg2 p-3 rounded border-2 border-accent/30">
                <div className="flex items-center gap-2">
                  <img src="/assets/game/images/heart_full.png" alt="festival" className="w-5 h-5 pixelated" />
                  <span className="text-sm text-accent font-display">📅 明日 星光节</span>
                </div>
                <p className="text-xs text-muted mt-1 font-body">所有宠物收到邀请，快来参加庆典！</p>
              </div>
              <div className="bg-bg2 p-3 rounded border-2 border-green-500/30">
                <div className="flex items-center gap-2">
                  <img src="/assets/game/atlases/generated/coin.png" alt="reward" className="w-5 h-5 pixelated" />
                  <span className="text-sm text-green-400 font-display">🎁 发现新物品</span>
                </div>
                <p className="text-xs text-muted mt-1 font-body">小星获得了星光碎片 x1</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pixel-box">
        <div className="bg-clay-700 p-4">
          <h3 className="font-display text-lg text-white mb-3 text-center">🗺️ 六域地图预览</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <Link to="/map?region=star-forest" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_forest.png" alt="星光森林" className="w-full h-16 object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">星光森林</p>
              </div>
            </Link>
            <Link to="/map?region=moon-lake" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_grass.png" alt="月牙湖" className="w-full h-16 object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">月牙湖</p>
              </div>
            </Link>
            <Link to="/map?region=crater" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_desert.png" alt="陨石坑" className="w-full h-16 object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">陨石坑</p>
              </div>
            </Link>
            <Link to="/map?region=crystal-cave" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_fall.png" alt="水晶洞窟" className="w-full h-16 object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">水晶洞窟</p>
              </div>
            </Link>
            <Link to="/map?region=cloud-peaks" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_winter.png" alt="云巅峰" className="w-full h-16 object-cover opacity-70 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">云巅峰</p>
              </div>
            </Link>
            <Link to="/map?region=abyss" className="group">
              <div className="relative rounded overflow-hidden border-2 border-clay-600 group-hover:border-accent transition">
                <img src="/assets/game/images/background_desert.png" alt="深渊裂谷" className="w-full h-16 object-cover opacity-70 grayscale group-hover:grayscale-0 group-hover:opacity-100 transition" />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2 to-transparent" />
                <p className="absolute bottom-1 left-2 text-xs font-display text-white">深渊裂谷</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home

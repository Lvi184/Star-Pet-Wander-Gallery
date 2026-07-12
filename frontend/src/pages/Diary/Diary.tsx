import React, { useEffect, useState } from 'react'
import { usePetStore } from '../../stores/petStore'

interface DiaryEntry {
  id: string
  title: string
  content: string
  scene_image_url?: string
  created_at: string
  mood: number
  location: string
}

const Diary: React.FC = () => {
  const pet = usePetStore()
  const [entries, setEntries] = useState<DiaryEntry[]>([])

  useEffect(() => {
    setEntries([
      {
        id: '1',
        title: '星光森林的奇遇',
        content:
          '今天我在星光森林漫步，发现了一条由萤火虫组成的光之小径。沿着小径走到尽头，我发现了一块散发着柔和蓝光的星光石。森林里很安静，只有风吹过树叶的沙沙声。我把星光石收进了背包，感觉今天真是幸运的一天。',
        scene_image_url: '/assets/game/images/background_forest.png',
        created_at: '2026-06-20',
        mood: 95,
        location: '星光森林',
      },
      {
        id: '2',
        title: '月牙湖畔的午后',
        content:
          '午后的月牙湖格外宁静，湖水像一面镜子，倒映着紫色的天空。我在湖边发现了一丛月牙草，叶片上挂着露珠，在月光下闪闪发光。采集了几片叶子，准备带回去做成香囊。',
        scene_image_url: '/assets/game/images/background_grass.png',
        created_at: '2026-06-19',
        mood: 85,
        location: '月牙湖',
      },
      {
        id: '3',
        title: '陨石坑底的秘密',
        content:
          '探险到陨石坑底部，这里比想象中要温暖。坑壁上有一些奇怪的符号，似乎是某种古老文明留下的印记。我用爪子轻轻触碰，符号竟然发出了微弱的金光。这是一个需要更多探索的地方。',
        scene_image_url: '/assets/game/images/background_desert.png',
        created_at: '2026-06-18',
        mood: 70,
        location: '陨石坑',
      },
      {
        id: '4',
        title: '水晶洞窟的发现',
        content:
          '在水晶洞窟深处，我发现了一个巨大的水晶簇，里面似乎封存着古老的记忆。水晶发出五彩斑斓的光芒，我在那里冥想了很久，感觉获得了某种神秘的力量。',
        scene_image_url: '/assets/game/images/background_fall.png',
        created_at: '2026-06-17',
        mood: 90,
        location: '水晶洞窟',
      },
    ])
  }, [pet.petId])

  const getMoodHearts = (mood: number) => {
    const hearts = []
    for (let i = 0; i < 5; i++) {
      if (mood > (i + 1) * 20) {
        hearts.push(<div key={i} className="heart full" />)
      } else if (mood > i * 20 && mood < (i + 1) * 20) {
        hearts.push(<div key={i} className="heart half" />)
      } else {
        hearts.push(<div key={i} className="heart empty" />)
      }
    }
    return hearts
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/assets/game/images/crystal.png" alt="diary" className="w-8 h-8 pixelated" />
          <h2 className="font-display text-2xl text-accent glow-text">漫游日记</h2>
        </div>
        <span className="text-sm text-muted font-body">共 {entries.length} 篇</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {entries.map((entry) => (
          <div 
            key={entry.id} 
            className="diary-entry group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="pixel-tag bg-accent/20 text-accent border-accent/40">
                  📍 {entry.location}
                </span>
                <div className="heart-container">{getMoodHearts(entry.mood)}</div>
              </div>
              <span className="text-xs text-muted font-body">{entry.created_at}</span>
            </div>
            
            {entry.scene_image_url && (
              <div className="relative rounded-lg overflow-hidden mb-3 border-2 border-clay-600 group-hover:border-accent transition">
                <img 
                  src={entry.scene_image_url} 
                  alt={entry.title}
                  className="w-full h-32 object-cover pixelated"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-bg2/80 to-transparent" />
                <h3 className="absolute bottom-2 left-3 font-display text-lg text-white glow-text">
                  {entry.title}
                </h3>
              </div>
            )}
            
            <p className="text-sm text-ink/80 font-body leading-relaxed line-clamp-3">
              {entry.content}
            </p>
            
            <button className="mt-3 game-button text-xs">
              阅读全文
            </button>
          </div>
        ))}
      </div>

      <div className="pixel-box">
        <div className="bg-clay-700 p-4 text-center">
          <p className="text-sm text-muted font-body">
            <img src="/assets/game/images/heart_empty.png" className="w-4 h-4 inline pixelated mr-2" />
            等待 {pet.name} 的新冒险...
          </p>
        </div>
      </div>
    </div>
  )
}

export default Diary

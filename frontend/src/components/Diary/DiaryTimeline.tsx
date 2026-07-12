import React, { useState } from 'react'

interface PetDiary {
  id: string
  title: string
  content: string
  scene_image_url?: string
  created_at: string
  mood?: string
}

interface DiaryTimelineProps {
  diaries: PetDiary[]
  onDiaryClick: (diary: PetDiary) => void
}

const moodEmojis: Record<string, string> = {
  '开心': '😊',
  '平静': '😌',
  '低落': '😢',
  '兴奋': '🤩',
  '好奇': '🤔',
}

const DiaryTimeline: React.FC<DiaryTimelineProps> = ({ diaries, onDiaryClick }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const groupedDiaries = diaries.reduce((acc, diary) => {
    const date = new Date(diary.created_at).toLocaleDateString('zh-CN')
    if (!acc[date]) acc[date] = []
    acc[date].push(diary)
    return acc
  }, {} as Record<string, PetDiary[]>)

  const sortedDates = Object.keys(groupedDiaries).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  )

  return (
    <div className="bg-bg2 rounded-xl p-4 border border-rule">
      <h3 className="text-sm font-semibold text-accent mb-3">📔 日记时间线</h3>
      
      {diaries.length === 0 ? (
        <div className="text-center py-4 text-xs text-muted">
          暂无日记记录
        </div>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((date) => (
            <div key={date}>
              <button
                className={`text-xs font-medium mb-2 flex items-center gap-2 transition-colors ${
                  selectedDate === date ? 'text-accent' : 'text-muted hover:text-primary'
                }`}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              >
                <span>{selectedDate === date ? '▼' : '▶'}</span>
                {date}
                <span className="text-xs bg-bg1 px-2 py-0.5 rounded-full">
                  {groupedDiaries[date].length}篇
                </span>
              </button>
              
              {(selectedDate === date || !selectedDate) && (
                <div className="space-y-2 pl-4 border-l-2 border-accent/30">
                  {groupedDiaries[date].map((diary) => (
                    <div
                      key={diary.id}
                      className="p-3 rounded-lg bg-bg1 hover:bg-bg0 cursor-pointer transition-colors"
                      onClick={() => onDiaryClick(diary)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-primary">{diary.title}</h4>
                        <span className="text-xs">
                          {moodEmojis[diary.mood || '平静'] || '😌'}
                        </span>
                      </div>
                      <p className="text-xs text-muted line-clamp-2">{diary.content}</p>
                      {diary.scene_image_url && (
                        <img
                          src={diary.scene_image_url}
                          alt={diary.title}
                          className="w-full h-24 object-cover rounded-lg mt-2"
                          loading="lazy"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default DiaryTimeline
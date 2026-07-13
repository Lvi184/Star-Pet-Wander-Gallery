import React, { useState } from 'react';

export interface PetDiary {
  id: string;
  title: string;
  content: string;
  scene_image_url?: string;
  created_at: string;
  mood?: string;
}

interface DiaryTimelineProps {
  diaries: PetDiary[];
  onDiaryClick?: (diary: PetDiary) => void;
  compact?: boolean;
}

const moodEmojis: Record<string, string> = {
  '开心': '😊',
  '平静': '😌',
  '低落': '😢',
  '兴奋': '🤩',
  '好奇': '🧐',
  'happy': '😊',
  'calm': '😌',
  'excited': '🤩',
  'sad': '😢',
  'curious': '🧐',
};

const DiaryTimeline: React.FC<DiaryTimelineProps> = ({ diaries, onDiaryClick, compact = true }) => {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const groupedDiaries = diaries.reduce((acc, diary) => {
    const date = new Date(diary.created_at).toLocaleDateString('zh-CN');
    if (!acc[date]) acc[date] = [];
    acc[date].push(diary);
    return acc;
  }, {} as Record<string, PetDiary[]>);

  const sortedDates = Object.keys(groupedDiaries).sort((a, b) =>
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className={`space-y-2 ${compact ? '' : ''}`}>
      {diaries.length === 0 ? (
        <div className="text-center py-4 text-xs text-cosmos-500">
          暂无漫游记录
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date}>
              <button
                className={`text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  selectedDate === date ? 'text-cosmos-300' : 'text-cosmos-500 hover:text-cosmos-300'
                }`}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              >
                <span>{selectedDate === date ? '▼' : '▶'}</span>
                {date}
                <span className="text-[10px] bg-cosmos-900/60 px-1.5 py-0.5 rounded-full border border-cosmos-800/50">
                  {groupedDiaries[date].length}篇
                </span>
              </button>

              {(selectedDate === date || !selectedDate) && (
                <div className="space-y-1.5 pl-3 border-l-2 border-cosmos-700/50">
                  {groupedDiaries[date].map((diary) => (
                    <div
                      key={diary.id}
                      className={`p-2 rounded-lg bg-cosmos-900/40 border border-cosmos-800/40 cursor-pointer transition-all hover:bg-cosmos-800/50 hover:border-cosmos-600/50 ${compact ? 'text-xs' : ''}`}
                      onClick={() => onDiaryClick?.(diary)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-cosmos-100 truncate">
                          {diary.title}
                        </span>
                        <span className="text-xs">
                          {moodEmojis[diary.mood || '平静'] || '😌'}
                        </span>
                      </div>
                      <p className="text-cosmos-400 line-clamp-2 leading-relaxed">
                        {diary.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DiaryTimeline;

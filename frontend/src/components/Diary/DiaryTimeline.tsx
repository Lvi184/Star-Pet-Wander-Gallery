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
        <div className="text-center py-4 text-xs text-clay-500 font-body">
          暂无漫游记录
        </div>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((date) => (
            <div key={date}>
              <button
                className={`text-xs font-body flex items-center gap-1.5 transition-colors ${
                  selectedDate === date ? 'text-clay-300' : 'text-clay-500 hover:text-clay-300'
                }`}
                onClick={() => setSelectedDate(selectedDate === date ? null : date)}
              >
                <span>{selectedDate === date ? '▼' : '▶'}</span>
                {date}
                <span className="text-[10px] bg-clay-900/80 px-1.5 py-0.5 border-2 border-clay-700">
                  {groupedDiaries[date].length}篇
                </span>
              </button>

              {(selectedDate === date || !selectedDate) && (
                <div className="space-y-1.5 pl-3 border-l-4 border-clay-700">
                  {groupedDiaries[date].map((diary) => (
                    <div
                      key={diary.id}
                      className={`p-2 bg-clay-900/60 border-2 border-clay-700/60 cursor-pointer transition-all hover:bg-clay-800/60 hover:border-clay-600 ${compact ? 'text-xs' : ''}`}
                      onClick={() => onDiaryClick?.(diary)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-display text-brown-200 truncate shadow-solid">
                          {diary.title}
                        </span>
                        <span className="text-xs">
                          {moodEmojis[diary.mood || '平静'] || '😌'}
                        </span>
                      </div>
                      <p className="text-clay-400 line-clamp-2 leading-relaxed font-body">
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

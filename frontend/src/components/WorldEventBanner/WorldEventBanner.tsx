import { useState, useEffect, useRef } from 'react';
import { eventBus, GAME_EVENTS } from '../../game/eventBus';

interface WorldEvent {
  id: string;
  name: string;
  description: string;
  event_type?: string;
}

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const MOCK_EVENTS: WorldEvent[] = [
  { id: 'meteor', name: '✨ 流星雨', description: '天降灵气，灵兽灵力充盈', event_type: 'meteor' },
  { id: 'tide', name: '🌊 灵气潮汐', description: '天地灵气翻涌，奇遇概率提升', event_type: 'tide' },
];

export default function WorldEventBanner() {
  const [events, setEvents] = useState<WorldEvent[]>(MOCK_EVENTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const carouselTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevEventRef = useRef<string | null>(null);

  useEffect(() => {
    fetchEvents();
    pollTimerRef.current = setInterval(fetchEvents, 30000);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_BASE}/world/events/active`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.events || [];
        if (list.length > 0) {
          setEvents(list);
        }
      }
    } catch (e) {
    }
  };

  useEffect(() => {
    if (events.length <= 1) {
      setCurrentIndex(0);
      return;
    }
    if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    carouselTimerRef.current = setInterval(() => {
      setCurrentIndex((i) => (i + 1) % events.length);
    }, 4000);
    return () => {
      if (carouselTimerRef.current) clearInterval(carouselTimerRef.current);
    };
  }, [events.length]);

  useEffect(() => {
    const current = events[currentIndex];
    if (!current) return;
    const key = current.id || current.name;
    if (prevEventRef.current !== key) {
      if (prevEventRef.current) {
        eventBus.emit(GAME_EVENTS.ENVIRONMENT_EVENT, {
          eventName: prevEventRef.current,
          action: 'end',
        });
      }
      eventBus.emit(GAME_EVENTS.ENVIRONMENT_EVENT, {
        eventName: current.name,
        eventType: current.event_type,
        action: 'start',
      });
      prevEventRef.current = key;
    }
  }, [currentIndex, events]);

  if (events.length === 0) return null;

  const current = events[currentIndex];

  return (
    <div className="glass px-4 py-2 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-xl shrink-0">🌠</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-gold-300 truncate">
            {current.name}
          </div>
          <div className="text-xs text-cosmos-300 truncate">
            {current.description}
          </div>
        </div>
      </div>
      <div className="text-xs text-cosmos-400 shrink-0">
        {currentIndex + 1}/{events.length}
      </div>
    </div>
  );
}

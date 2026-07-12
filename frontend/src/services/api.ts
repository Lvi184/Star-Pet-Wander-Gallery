import axios from 'axios';

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'http://localhost:8001' 
  : '';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;

export const petApi = {
  getStatus: (petId: string) => api.get(`/pet/${petId}/status`),
  interact: (petId: string, action: object) => api.post(`/pet/${petId}/interact`, action),
  sync: (petId: string, lastOnlineTime: string) =>
    api.post(`/pet/${petId}/sync`, { last_online_time: lastOnlineTime }),
  getEvents: (petId: string, limit = 20) => api.get(`/pet/${petId}/events?limit=${limit}`),
};

export const diaryApi = {
  getList: (petId: string, skip = 0, limit = 20) =>
    api.get(`/diary/pet/${petId}?skip=${skip}&limit=${limit}`),
  getDetail: (entryId: string) => api.get(`/diary/${entryId}`),
  generate: (petId: string, data: object) => api.post(`/diary/pet/${petId}`, data),
};

export const worldApi = {
  getMap: () => api.get('/world/map'),
  getState: () => api.get('/world/state'),
  tick: () => api.post('/world/tick'),
  getEvents: () => api.get('/world/events'),
  getFate: (regionId: string) => api.get(`/world/fate/${regionId}`),
  getWeather: (regionId: string) => api.get(`/world/weather/${regionId}`),
};

export const characterApi = {
  getStatus: (charId: string) => api.get(`/character/${charId}/status`),
  performAction: (charId: string, actionData: object) => api.post(`/character/${charId}/action`, actionData),
  takeover: (charId: string) => api.post(`/character/${charId}/control/takeover`),
  release: (charId: string) => api.post(`/character/${charId}/control/release`),
  heartbeat: (charId: string) => api.post(`/character/${charId}/heartbeat`),
  getEvents: (charId: string) => api.get(`/character/${charId}/events`),
  getDestiny: (charId: string) => api.get(`/character/${charId}/destiny`),
  rewind: (charId: string, checkpointId?: string) => api.post(`/character/${charId}/rewind`, { checkpoint_id: checkpointId }),
  getCheckpoints: (charId: string) => api.get(`/character/${charId}/checkpoints`),
  getWorldline: (charId: string) => api.get(`/character/${charId}/worldline`),
  getDeathReport: (charId: string) => api.get(`/character/${charId}/death-report`),
  runAITurn: (charId: string) => api.post(`/character/${charId}/ai-turn`),
  updatePosition: (charId: string, position: { x: number; y: number; region: string }) => 
    api.post(`/character/${charId}/position`, position),
};

export const eventApi = {
  getRecent: (limit = 20) => api.get(`/events?limit=${limit}`),
  getByRegion: (regionId: string, limit = 20) => api.get(`/events/region/${regionId}?limit=${limit}`),
  trigger: (eventData: object) => api.post('/events/trigger', eventData),
};

export const authApi = {
  login: (credentials: { username: string; password: string }) => api.post('/auth/login', credentials),
  register: (userData: { username: string; password: string; email?: string }) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

export const worldlineApi = {
  getHistory: (charId: string) => api.get(`/character/${charId}/worldline`),
  addEvent: (charId: string, eventData: object) => api.post(`/character/${charId}/worldline`, eventData),
};

export const destinyApi = {
  getToday: () => api.get('/destiny/today'),
  getByRegion: (regionId: string) => api.get(`/destiny/region/${regionId}`),
};

export const notificationApi = {
  getUnread: () => api.get('/notifications/unread'),
  markRead: (notificationId: string) => api.post(`/notifications/${notificationId}/read`),
  markAllRead: () => api.post('/notifications/read-all'),
};

export const gameApi = {
  startGame: () => api.post('/game/start'),
  saveGame: (gameData: object) => api.post('/game/save', gameData),
  loadGame: (saveId: string) => api.get(`/game/load/${saveId}`),
};

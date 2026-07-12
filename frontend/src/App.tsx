import { Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home/Home';
import Diary from './pages/Diary/Diary';
import MapPage from './pages/Map/MapPage';
import Interact from './pages/Interact/Interact';
import TodoPage from './pages/Todo/TodoPage';
import Explore from './pages/Explore/Explore';
import Worldline from './pages/Worldline/Worldline';

function App() {
  const navItems = [
    { path: '/', label: '🏠 首页' },
    { path: '/explore', label: '🌍 探索' },
    { path: '/worldline', label: '🌌 世界线' },
    { path: '/diary', label: '📖 日记' },
    { path: '/map', label: '🗺️ 地图' },
    { path: '/interact', label: '🎮 互动' },
    { path: '/todo', label: '✅ 待办' },
  ];

  return (
    <div className="min-h-screen bg-bg">
      <nav className="border-b-4 border-clay-700 bg-bg2/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <Link to="/" className="font-display text-2xl tracking-wider game-title">
            🌟 星宠漫游馆 🌟
          </Link>
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-2 text-sm font-body text-muted hover:text-white hover:bg-clay-700/50 rounded transition-all duration-200 border-2 border-transparent hover:border-accent"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/worldline" element={<Worldline />} />
          <Route path="/diary" element={<Diary />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/interact" element={<Interact />} />
          <Route path="/todo" element={<TodoPage />} />
        </Routes>
      </main>

      <footer className="border-t-4 border-clay-700 bg-bg2/50 mt-12">
        <div className="mx-auto max-w-7xl px-4 py-6 text-center">
          <p className="text-xs text-muted font-body">
            🎮 星宠漫游馆 - 你的AI数字生命宠物伙伴 | 山海灵境世界观
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;

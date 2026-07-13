import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './pages/MainLayout/MainLayout';
import PetCreatePage from './pages/PetCreate/PetCreatePage';
import { useDevicePerformance } from './hooks/useDevicePerformance';

function App() {
  useDevicePerformance();

  return (
    <Routes>
      <Route path="/" element={<MainLayout />} />
      <Route path="/create" element={<PetCreatePage />} />
      <Route path="/explore" element={<Navigate to="/" replace />} />
      <Route path="/worldline" element={<Navigate to="/" replace />} />
      <Route path="/diary" element={<Navigate to="/" replace />} />
      <Route path="/map" element={<Navigate to="/" replace />} />
      <Route path="/interact" element={<Navigate to="/" replace />} />
      <Route path="/todo" element={<Navigate to="/" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

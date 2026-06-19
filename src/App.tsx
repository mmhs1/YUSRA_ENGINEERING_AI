import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLoading } from './context/LoadingContext';
import { SkeletonLoader } from './components/SkeletonLoader';
import Chat from './pages/Chat';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import { useEffect, useState } from 'react';
import { TouchRipple } from './components/TouchRipple';
import { AnimatedBackground } from './components/AnimatedBackground';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('auth_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default function App() {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return <div className="h-screen w-full bg-neutral-50 dark:bg-neutral-900" />;

  return (
    <Router>
      <AnimatedBackground />
      <TouchRipple />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

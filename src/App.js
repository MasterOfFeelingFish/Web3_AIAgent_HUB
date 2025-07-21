import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Home from './pages/Home';
import Navbar from './components/Navbar';
import Services from './pages/Services';
import Developer from './pages/Developer';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

function RequireAuth({ children }) {
  const token = localStorage.getItem('accessToken');
  const location = useLocation();
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}

function RequireDev({ children }) {
  const role = localStorage.getItem('role');
  if (role === 'developer' || role === 'admin') return children;
  return <Navigate to="/home" replace />;
}

const FixedPage = ({ children }) => (
  <div style={{ position: 'fixed', inset: 0, paddingTop: 56, background: 'var(--bg-main)', overflow: 'hidden', zIndex: 0 }}>
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {children}
    </div>
  </div>
);

const Placeholder = ({ title }) => (
  <FixedPage>
    <div style={{ fontSize: 28, color: 'var(--color-primary)', fontWeight: 600 }}>{title} 页面开发中...</div>
  </FixedPage>
);

function App() {
  // 主题管理
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    document.body.style.overflow = 'hidden';
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <Router>
      <Navbar theme={theme} onToggleTheme={handleToggleTheme} />
      <Routes>
        <Route path="/login" element={<Login onLogin={() => {}} />} />
        <Route path="/home" element={
          <RequireAuth>
            <Home />
          </RequireAuth>
        } />
        <Route path="/services" element={<RequireAuth><Services /></RequireAuth>} />
        <Route path="/developer" element={<RequireAuth><RequireDev><Developer /></RequireDev></RequireAuth>} />
        <Route path="/about" element={<Placeholder title="关于" />} />
        <Route path="/settings" element={<Placeholder title="设置" />} />
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const navs = [
  { label: '首页', path: '/home' },
  { label: '服务', path: '/services' },
  { label: '关于', path: '/about' },
  { label: '设置', path: '/settings' },
];

function Navbar({ theme, onToggleTheme }) {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem('username') || '';
  const role = localStorage.getItem('role') || '';
  return (
    <nav style={{
      width: '100%',
      height: 56,
      background: 'var(--bg-card)',
      color: 'var(--text-main)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 var(--space-lg)',
      boxSizing: 'border-box',
      boxShadow: theme === 'dark' ? '0 2px 8px #0002' : '0 2px 8px #4FD1C522',
      position: 'fixed',
      top: 0,
      left: 0,
      zIndex: 100,
      fontFamily: 'var(--font-main)',
      borderBottom: '1px solid var(--border-main)'
    }}>
      {/* 左侧LOGO/标题 */}
      <div style={{ minWidth: 120, display: 'flex', alignItems: 'center', zIndex: 2 }}>
        <span style={{ fontWeight: 700, fontSize: 20, letterSpacing: 2, color: 'var(--color-primary)', fontFamily: 'var(--font-main)' }}>
          Echo
        </span>
      </div>
      {/* 中间导航按钮绝对居中 */}
      <div style={{ position: 'absolute', left: '50%', top: 0, height: 56, transform: 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: 32, zIndex: 1 }}>
        {navs.map(nav => (
          <button
            key={nav.path}
            onClick={() => navigate(nav.path)}
            style={{
              background: 'none',
              border: 'none',
              color: location.pathname === nav.path ? 'var(--color-primary)' : 'var(--text-main)',
              fontWeight: location.pathname === nav.path ? 700 : 500,
              fontSize: 17,
              cursor: 'pointer',
              padding: 0,
              borderBottom: location.pathname === nav.path ? '2.5px solid var(--color-primary)' : '2.5px solid transparent',
              transition: 'color 0.2s, border 0.2s',
              backgroundClip: 'padding-box',
              fontFamily: 'var(--font-main)',
            }}
          >
            {nav.label}
          </button>
        ))}
      </div>
      {/* 右侧主题切换和用户中心 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 18, zIndex: 2 }}>
        {/* 用户身份标识 */}
        {username && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 4 }}>
            <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 15 }}>{username}</span>
            {role && <span style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 12, padding: '2px 10px', fontSize: 13, fontWeight: 500 }}>{role}</span>}
          </div>
        )}
        <button
          onClick={onToggleTheme}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            fontSize: 22,
            color: theme === 'dark' ? '#fff' : 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 'var(--radius)',
            padding: 'var(--space-sm)',
            transition: 'background 0.2s',
          }}
          aria-label="切换主题"
        >
          {theme === 'dark' ? (
            // 月亮图标
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.5 18.5C19.5 20.5 16.5 21.5 13.5 20.5C10.5 19.5 8.5 16.5 9.5 13.5C10.5 10.5 13.5 8.5 16.5 9.5C17.5 9.83333 18.5 10.5 19.5 11.5" stroke="#fbbf24" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="14" cy="14" r="13" stroke="#fbbf24" strokeWidth="2"/>
            </svg>
          ) : (
            // 太阳图标
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="14" cy="14" r="6" fill="#fbbf24"/>
              <g stroke="#fbbf24" strokeWidth="2">
                <line x1="14" y1="2" x2="14" y2="6"/>
                <line x1="14" y1="22" x2="14" y2="26"/>
                <line x1="2" y1="14" x2="6" y2="14"/>
                <line x1="22" y1="14" x2="26" y2="14"/>
                <line x1="5.22" y1="5.22" x2="8.05" y2="8.05"/>
                <line x1="19.95" y1="19.95" x2="22.78" y2="22.78"/>
                <line x1="5.22" y1="22.78" x2="8.05" y2="19.95"/>
                <line x1="19.95" y1="8.05" x2="22.78" y2="5.22"/>
              </g>
            </svg>
          )}
        </button>
        {/* 用户中心icon按钮 */}
        <button
          style={{
            width: 36,
            height: 36,
            background: 'var(--color-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontWeight: 700,
            fontSize: 18,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(79,209,197,0.10)',
            transition: 'background 0.2s',
          }}
          aria-label="用户中心"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="10" cy="7" r="4" fill="#fff" fillOpacity="0.7"/>
            <ellipse cx="10" cy="15.5" rx="6" ry="3.5" fill="#fff" fillOpacity="0.7"/>
          </svg>
        </button>
      </div>
    </nav>
  );
}

export default Navbar;

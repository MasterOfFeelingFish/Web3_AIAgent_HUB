import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';
const API_PREFIX = process.env.REACT_APP_API_PREFIX || '/api/v1';

const TEST_USERS = [
  { username: 'testuser_5090', password: '8lpcUY2BOt', role: '普通用户' },
  { username: 'devuser_5090', password: 'mryuWTGdMk', role: '开发者' },
  { username: 'adminuser_5090', password: 'SAKMRtxCjT', role: '管理员' },
];

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);
      const res = await fetch(`${API_BASE}${API_PREFIX}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('账号或密码错误');
        } else {
          throw new Error('登录失败，请稍后重试');
        }
      }
      const data = await res.json();
      if (!data.access_token || !data.role) {
        throw new Error('登录响应异常');
      }
      localStorage.setItem('accessToken', data.access_token);
      localStorage.setItem('role', data.role);
      localStorage.setItem('username', username); // 保存用户名
      if (data.userId) {
        localStorage.setItem('userId', data.userId);
      } else if (data.user && data.user.id) {
        localStorage.setItem('userId', data.user.id);
      }
      setLoading(false);
      if (onLogin) onLogin(data);
      navigate('/home', { replace: true });
    } catch (err) {
      setError(err.message || '登录失败');
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, var(--bg-main) 0%, var(--bg-card) 100%)' }}>
      <div className="card-theme" style={{ width: 350, borderRadius: 'var(--radius)', boxShadow: '0 4px 24px rgba(79,209,197,0.08)', padding: 'var(--space-lg)', boxSizing: 'border-box' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
          <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 8, fontFamily: 'var(--font-main)' }}>AI语音助手</div>
          <div style={{ color: 'var(--text-secondary)', fontSize: 16 }}>登录您的账号</div>
        </div>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <input
              type="text"
              placeholder="用户名"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              style={{ width: '100%', borderRadius: 'var(--radius)', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
              autoFocus
            />
          </div>
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <input
              type="password"
              placeholder="密码"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              style={{ width: '100%', borderRadius: 'var(--radius)', fontSize: 16, outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          {error && <div className="text-error" style={{ marginBottom: 'var(--space-md)', textAlign: 'center', fontSize: 15 }}>{error}</div>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
        <div style={{ marginTop: 'var(--space-lg)', color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.7 }}>
          <div>测试账号：</div>
          {TEST_USERS.map(u => (
            <div key={u.username}>
              {u.username} / {u.password}（{u.role}）
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Login;
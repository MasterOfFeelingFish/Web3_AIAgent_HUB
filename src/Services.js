import React, { useEffect, useState } from 'react';

const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';
const API_PREFIX = process.env.REACT_APP_API_PREFIX || '/api/v1';

async function getTools() {
  const token = localStorage.getItem('accessToken');
  const res = await fetch(`${API_BASE}${API_PREFIX}/tools`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || '获取工具列表失败');
  }
  return res.json();
}

function Services() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    getTools()
      .then(data => setTools(data.tools || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, paddingTop: 56, background: 'var(--bg-main)', overflow: 'hidden', zIndex: 0 }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-lg) 0', overflowY: 'auto' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 32 }}>服务目录</div>
        {loading && <div style={{ color: 'var(--color-primary)', fontSize: 18, marginTop: 40 }}>加载中...</div>}
        {error && <div className="text-error card-theme" style={{ fontSize: 17, marginTop: 40, padding: 24 }}>{error}</div>}
        {!loading && !error && tools.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: 17, marginTop: 40 }}>暂无可用服务</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', width: '100%', maxWidth: 900 }}>
          {tools.map(tool => (
            <div key={tool.tool_id} className="card-theme" style={{ minWidth: 260, maxWidth: 320, flex: '1 1 260px', padding: 24, borderRadius: 'var(--radius)', boxShadow: '0 2px 8px rgba(79,209,197,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 20, color: 'var(--color-primary)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>{tool.description}</div>
              <div style={{ fontSize: 14, color: '#fff', background: 'var(--color-primary)', borderRadius: 12, padding: '2px 12px', alignSelf: 'flex-start', fontWeight: 500 }}>{tool.type}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Services; 
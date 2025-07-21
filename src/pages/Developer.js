import React, { useEffect, useState } from 'react';
import { apiRequest } from '../api/apiClient';

function isDeveloper() {
  const role = localStorage.getItem('role');
  return role === 'developer' || role === 'admin';
}

async function getDevTools() {
  return apiRequest('/dev/tools');
}

function Developer() {
  const [tools, setTools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noPermission, setNoPermission] = useState(false);

  useEffect(() => {
    if (!isDeveloper()) {
      setNoPermission(true);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    getDevTools()
      .then(data => setTools(data.tools || []))
      .catch(e => {
        if (e.message.includes('403')) setNoPermission(true);
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (noPermission) {
    return (
      <div style={{ position: 'fixed', inset: 0, paddingTop: 56, background: 'var(--bg-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error)', fontSize: 22 }}>
        无权限访问开发者控制台
      </div>
    );
  }

  return (
    <div style={{ position: 'fixed', inset: 0, paddingTop: 56, background: 'var(--bg-main)', overflow: 'hidden', zIndex: 0 }}>
      <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-lg) 0', overflowY: 'auto' }}>
        <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)', marginBottom: 32 }}>开发者服务管理</div>
        {loading && <div style={{ color: 'var(--color-primary)', fontSize: 18, marginTop: 40 }}>加载中...</div>}
        {error && <div className="text-error card-theme" style={{ fontSize: 17, marginTop: 40, padding: 24 }}>{error}</div>}
        {!loading && !error && tools.length === 0 && <div style={{ color: 'var(--text-secondary)', fontSize: 17, marginTop: 40 }}>暂无可管理服务</div>}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24, justifyContent: 'center', width: '100%', maxWidth: 900 }}>
          {tools.map(tool => (
            <div key={tool.tool_id} className="card-theme" style={{ minWidth: 260, maxWidth: 320, flex: '1 1 260px', padding: 24, borderRadius: 'var(--radius)', boxShadow: '0 2px 8px rgba(79,209,197,0.06)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ fontWeight: 600, fontSize: 20, color: 'var(--color-primary)', marginBottom: 6 }}>{tool.name}</div>
              <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 8 }}>{tool.description}</div>
              <div style={{ fontSize: 14, color: '#fff', background: 'var(--color-primary)', borderRadius: 12, padding: '2px 12px', alignSelf: 'flex-start', fontWeight: 500 }}>{tool.type}</div>
              {/* 可扩展：启用/禁用/删除按钮等 */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Developer; 
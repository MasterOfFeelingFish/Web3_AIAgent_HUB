// src/api/apiClient.js
const API_BASE = process.env.REACT_APP_API_BASE_URL || 'https://rqoufedpoguc.sealosgzg.site';
const API_PREFIX = process.env.REACT_APP_API_PREFIX || '/api/v1';

function logoutAndRedirect() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('userId');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
  window.location.href = '/login';
}

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('accessToken');
  const url = `${API_BASE}${API_PREFIX}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    },
    ...options
  };
  const res = await fetch(url, config);
  if (res.status === 401) {
    logoutAndRedirect();
    throw new Error('未授权，请重新登录');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `API Error: ${res.status}`);
  }
  return res.json();
} 
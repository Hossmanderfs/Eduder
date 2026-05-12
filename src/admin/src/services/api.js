// src/admin/src/services/api.js — EduDer Panel Admin
// Configuración central de fetch para el Panel Admin.
// RF-03 | RNF-03 — Lee el token JWT del localStorage y lo inyecta en cada request.

const API_BASE = 'http://localhost:3000';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('eduder_admin_token');
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.message || `Error ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

// CU-06 | RF-21 | E12 - Gestión de Usuarios
export const adminApi = {
  // Auth
  login:       (body)     => apiFetch('/auth/login',           { method: 'POST', body: JSON.stringify(body) }),
  // Niveles — CRUD completo (maestra con componente visual)
  getLevels:   ()         => apiFetch('/levels'),
  createLevel: (body)     => apiFetch('/levels',               { method: 'POST', body: JSON.stringify(body) }),
  updateLevel: (id, body) => apiFetch(`/levels/${id}`,         { method: 'PUT',  body: JSON.stringify(body) }),
  deleteLevel: (id)       => apiFetch(`/levels/${id}`,         { method: 'DELETE' }),
  // Usuarios — Gestión admin
  getUsers:    (q = '')   => apiFetch(`/admin/users${q}`),
  updateUser:  (id, body) => apiFetch(`/admin/users/${id}`,    { method: 'PATCH', body: JSON.stringify(body) }),
  // Métricas — RF-22
  getMetrics:  ()         => apiFetch('/admin/metrics'),
};

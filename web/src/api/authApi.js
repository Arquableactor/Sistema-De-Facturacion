import { api } from './client.js'

// POST /api/auth/login -> { token, email, role, expiresAt }
export function login(email, password) {
  return api.post('/api/auth/login', { email, password })
}

// GET /api/auth/me -> { id, email, role }  (valida que el token siga vigente)
export function me() {
  return api.get('/api/auth/me')
}

import { api } from './client.js'

// Lectura de usuarios para poblar selects (ej. responsable de proyecto). Cualquier rol.
export function getUsers(onlyActive = true) {
  return api.get(`/api/users${onlyActive ? '' : '?onlyActive=false'}`)
}

// --- Gestión de usuarios (solo Admin) ---

// Lista completa (con email/estado/fecha). Incluye inactivos por defecto.
export function getUsersManage(includeInactive = true) {
  return api.get(`/api/users/manage${includeInactive ? '' : '?includeInactive=false'}`)
}

// { fullName, email, password, role }
export function createUser(payload) {
  return api.post('/api/users', payload)
}

// { fullName, email, role, isActive } (sin contraseña)
export function updateUser(id, payload) {
  return api.put(`/api/users/${id}`, payload)
}

// Restablecer contraseña (acción sensible aparte de la edición).
export function resetUserPassword(id, newPassword) {
  return api.post(`/api/users/${id}/reset-password`, { newPassword })
}

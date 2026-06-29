import { api } from './client.js'

// Módulo Proyectos sobre el cliente central (mismo patrón que clientsApi/productsApi).
export function getProjects(includeInactive = false) {
  return api.get(`/api/projects${includeInactive ? '?includeInactive=true' : ''}`)
}

export function getProject(id) {
  return api.get(`/api/projects/${id}`)
}

export function createProject(data) {
  return api.post('/api/projects', data)
}

export function updateProject(id, data) {
  return api.put(`/api/projects/${id}`, data)
}

// PATCH puntual de etapa + progreso (sin abrir el form completo).
export function updateStageProgress(id, data) {
  return api.patch(`/api/projects/${id}/stage-progress`, data)
}

export function deleteProject(id) {
  return api.del(`/api/projects/${id}`)
}

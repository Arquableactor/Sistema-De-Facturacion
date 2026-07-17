import { api } from './client.js'

// CRUD del catálogo de electrodomésticos (autenticado, solo Admin). Distinto del
// público getAppliances() de solicitudesApi.js, que da solo los activos y sin Bearer.

export function getAppliancesAdmin(includeInactive = false) {
  return api.get(`/api/appliances${includeInactive ? '?includeInactive=true' : ''}`)
}

export function createAppliance(payload) {
  return api.post('/api/appliances', payload)
}

export function updateAppliance(id, payload) {
  return api.put(`/api/appliances/${id}`, payload)
}

// Borrado lógico (IsActive=false) en el backend.
export function deleteAppliance(id) {
  return api.del(`/api/appliances/${id}`)
}

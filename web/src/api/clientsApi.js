import { api } from './client.js'

// Módulo Clientes sobre el cliente central. Devuelven JSON o propagan ApiError
// (con .message / .details) para que la UI lo muestre.

export function getClients(includeInactive = false) {
  return api.get(`/api/clients${includeInactive ? '?includeInactive=true' : ''}`)
}

export function getClient(id) {
  return api.get(`/api/clients/${id}`)
}

export function createClient(data) {
  return api.post('/api/clients', data)
}

export function updateClient(id, data) {
  return api.put(`/api/clients/${id}`, data)
}

export function deleteClient(id) {
  return api.del(`/api/clients/${id}`)
}

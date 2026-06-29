import { api } from './client.js'

// Módulo Productos sobre el cliente central (mismo patrón que clientsApi).
export function getProducts(includeInactive = false) {
  return api.get(`/api/products${includeInactive ? '?includeInactive=true' : ''}`)
}

export function getProduct(id) {
  return api.get(`/api/products/${id}`)
}

export function createProduct(data) {
  return api.post('/api/products', data)
}

export function updateProduct(id, data) {
  return api.put(`/api/products/${id}`, data)
}

export function deleteProduct(id) {
  return api.del(`/api/products/${id}`)
}

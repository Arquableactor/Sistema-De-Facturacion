import { api } from './client.js'

// Secuencias NCF. Administrar es solo Admin; el resumen /estado también lo ve Facturación
// para sus avisos. No hay delete: se desactiva con un PUT (isActive=false).

export function getNcfSequences() {
  return api.get('/api/ncf-sequences')
}

export function createNcfSequence(payload) {
  return api.post('/api/ncf-sequences', payload)
}

// Solo datos administrativos (número de autorización, vencimiento, activo). Los números
// del comprobante NO se envían: el backend ni siquiera los acepta.
export function updateNcfSequence(id, payload) {
  return api.put(`/api/ncf-sequences/${id}`, payload)
}

export function getNcfEstado() {
  return api.get('/api/ncf-sequences/estado')
}

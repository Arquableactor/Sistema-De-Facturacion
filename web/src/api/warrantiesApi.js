import { api, getBlob, saveBlob, getPublic } from './client.js'

// Garantías. Se generan DESDE un proyecto; no hay editar/anular por API.
export function getWarranties({ clientId, projectId } = {}) {
  const qs = new URLSearchParams()
  if (clientId) qs.set('clientId', clientId)
  if (projectId) qs.set('projectId', projectId)
  const s = qs.toString()
  return api.get(`/api/warranties${s ? `?${s}` : ''}`)
}

export function getWarranty(id) {
  return api.get(`/api/warranties/${id}`)
}

export function generateWarranty(data) {
  return api.post('/api/warranties', data)
}

// Búsqueda por serial EXACTO (el backend es case-sensitive; solo hacemos trim).
export function searchBySerial(serial) {
  return api.get(`/api/warranties/by-serial/${encodeURIComponent(serial)}`)
}

export async function downloadWarrantyPdf(id, warrantyNumber) {
  const blob = await getBlob(`/api/warranties/${id}/pdf`)
  saveBlob(blob, `certificado-${warrantyNumber || id}.pdf`)
}

// Verificación PÚBLICA (anónima) por verificationCode. Sin token; usada por la
// página /verificar/:code que abre el QR del certificado.
export function verifyPublic(code) {
  return getPublic(`/api/public/verify/${encodeURIComponent(code)}`)
}

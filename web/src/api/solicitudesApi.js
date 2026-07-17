import { api, getPublic, postPublic } from './client.js'

// Captación pública: ambos endpoints son ANÓNIMOS (sin Bearer). El prospecto llega
// desde un link de WhatsApp y no tiene cuenta.

// GET /api/public/appliances -> [{ id, nombre, watts, horasSugeridas, categoria }]
export function getAppliances() {
  return getPublic('/api/public/appliances')
}

// POST /api/public/solicitudes -> { numeroSolicitud, consumoEstimadoKwhDia,
//                                   consumoEstimadoKwhMes, costoElectricoEstimadoMensual }
// El estimado que devuelve el SERVER es la verdad; el de la pantalla es solo un avance.
export function createSolicitud(payload) {
  return postPublic('/api/public/solicitudes', payload)
}

// --- Bandeja interna (autenticada, Admin/Facturación) ---

export function getSolicitudes({ estado, search } = {}) {
  const params = new URLSearchParams()
  if (estado) params.set('estado', estado)
  if (search) params.set('search', search)
  const qs = params.toString()
  return api.get(`/api/solicitudes${qs ? `?${qs}` : ''}`)
}

export function getSolicitud(id) {
  return api.get(`/api/solicitudes/${id}`)
}

// datosCorregidos: { nombre, phone, email?, provincia?, ubicacion } — NO documento.
export function aprobarSolicitud(id, datosCorregidos) {
  return api.post(`/api/solicitudes/${id}/aprobar`, datosCorregidos)
}

export function rechazarSolicitud(id, motivoRechazo) {
  return api.post(`/api/solicitudes/${id}/rechazar`, { motivoRechazo })
}

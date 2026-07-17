import { getPublic, postPublic } from './client.js'

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

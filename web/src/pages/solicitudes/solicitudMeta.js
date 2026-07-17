// Estado de una solicitud → etiqueta + tono del Badge. Ámbar = espera acción,
// verde = convertida en cliente, rojo = descartada.
const META = {
  Pendiente: { label: 'Pendiente', tone: 'amber' },
  Aprobada: { label: 'Aprobada', tone: 'green' },
  Rechazada: { label: 'Rechazada', tone: 'red' },
}

export function estadoMeta(estado) {
  return META[estado] || { label: estado, tone: 'gray' }
}

// Filtros de la barra (incluye "Todas").
export const ESTADO_FILTERS = [
  { value: '', label: 'Todas' },
  { value: 'Pendiente', label: 'Pendientes' },
  { value: 'Aprobada', label: 'Aprobadas' },
  { value: 'Rechazada', label: 'Rechazadas' },
]

const DOC_LABEL = { Cedula: 'Cédula', Rnc: 'RNC', Passport: 'Pasaporte' }
export const docLabel = (t) => DOC_LABEL[t] || t

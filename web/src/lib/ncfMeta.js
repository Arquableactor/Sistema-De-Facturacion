// Presentación de las secuencias NCF: colores del estado y de la severidad, y los mensajes
// de los avisos. TODO el cálculo (restantes/días/estado/severidad) lo hace el backend; aquí
// solo mapeamos a la UI, para no duplicar reglas ni umbrales.

// estado derivado (backend) -> tono de Badge + etiqueta.
const ESTADO = {
  Activa: { tone: 'green', label: 'Activa' },
  PorAgotarse: { tone: 'amber', label: 'Por agotarse' },
  PorVencer: { tone: 'amber', label: 'Por vencer' },
  Agotada: { tone: 'red', label: 'Agotada' },
  Vencida: { tone: 'red', label: 'Vencida' },
  Inactiva: { tone: 'gray', label: 'Inactiva' },
}

export function estadoMeta(estado) {
  return ESTADO[estado] || { tone: 'gray', label: estado || '—' }
}

const SEV_RANK = { ok: 0, advertencia: 1, critico: 2 }
export function severidadRank(sev) {
  return SEV_RANK[sev] ?? 0
}

// Severidad global = la peor entre los tipos del resumen /estado.
export function worstSeveridad(items) {
  return (items || []).reduce(
    (worst, it) => (severidadRank(it.severidad) > severidadRank(worst) ? it.severidad : worst),
    'ok',
  )
}

// Tono por severidad para tarjeta/banner.
export const SEV_META = {
  ok: { badge: 'green', label: 'Al día' },
  advertencia: { badge: 'amber', label: 'Atención' },
  critico: { badge: 'red', label: 'Crítico' },
}

// Mensaje corto por tipo para los avisos.
export function estadoMensaje(it) {
  if (it.restantes <= 0) return `${it.type}: sin comprobantes disponibles`
  const n = it.restantes.toLocaleString('es-DO')
  let msg = `${it.type}: quedan ${n} comprobante${it.restantes === 1 ? '' : 's'}`
  if (it.diasParaVencer != null) {
    msg += ` · vence en ${it.diasParaVencer} día${it.diasParaVencer === 1 ? '' : 's'}`
  }
  return msg
}

// Estimado EN VIVO mientras el prospecto marca equipos. Espeja la fórmula del backend
// (Σ watts×cantidad×horas / 1000, 2 decimales), pero el SERVER es la verdad: al enviar
// se muestra el estimado que devuelve la respuesta y este se descarta.
// Mismo trato que los totales de la factura: estimar en cliente, confirmar contra el server.
const DIAS_DEL_MES = 30

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

// lineas: [{ watts, cantidad, horasPorDia }]
export function estimateConsumo(lineas) {
  const wh = lineas.reduce(
    (s, l) => s + (Number(l.watts) || 0) * (Number(l.cantidad) || 0) * (Number(l.horasPorDia) || 0),
    0,
  )
  const kwhDia = round2(wh / 1000)
  return { kwhDia, kwhMes: round2(kwhDia * DIAS_DEL_MES) }
}

// Orden y color de cada categoría. El color viene del diseño y coincide con un token
// existente, así que se toma de la variable CSS: el modo oscuro lo ajusta solo.
export const CATEGORIAS = [
  { nombre: 'Climatización', varName: '--c-primary', soft: 'bg-primary-soft', text: 'text-primary' },
  { nombre: 'Cocina', varName: '--c-amber', soft: 'bg-amber-soft', text: 'text-amber-strong' },
  { nombre: 'Agua', varName: '--c-green', soft: 'bg-green-soft', text: 'text-green-strong' },
  { nombre: 'Entretenimiento', varName: '--c-purple', soft: 'bg-purple-soft', text: 'text-purple-strong' },
  { nombre: 'Lavado', varName: '--c-orange', soft: 'bg-orange-soft', text: 'text-orange-strong' },
  { nombre: 'Iluminación', varName: '--c-brand-text', soft: 'bg-brand-soft', text: 'text-brand-text' },
]

const FALLBACK = CATEGORIAS[0]

export function categoriaMeta(nombre) {
  return CATEGORIAS.find((c) => c.nombre === nombre) || FALLBACK
}

// Agrupa el catálogo por categoría, respetando el orden de CATEGORIAS y dejando al
// final cualquier categoría nueva que el admin agregue (sesión 2) sin romper la página.
export function agruparPorCategoria(appliances) {
  const grupos = new Map()
  for (const a of appliances) {
    const key = a.categoria || 'Otros'
    if (!grupos.has(key)) grupos.set(key, [])
    grupos.get(key).push(a)
  }
  const orden = CATEGORIAS.map((c) => c.nombre)
  return [...grupos.entries()].sort((a, b) => {
    const ia = orden.indexOf(a[0])
    const ib = orden.indexOf(b[0])
    return (ia < 0 ? 99 : ia) - (ib < 0 ? 99 : ib)
  })
}

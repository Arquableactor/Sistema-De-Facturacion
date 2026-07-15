// Formatos del handoff. Moneda: RD$ #,###.00 · Fecha: DD/MM/AAAA.

export function money(value) {
  const n = Number(value || 0)
  return 'RD$ ' + n.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export function date(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

// Teléfono: se guardan 10 dígitos pelados; para MOSTRAR los agrupamos 809-000-0000.
// Filas antiguas con otro formato se muestran tal cual (no inventamos dígitos).
export function phone(value) {
  const digits = String(value ?? '').replace(/\D/g, '')
  if (digits.length !== 10) return value || '—'
  return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
}

// 'YYYY-MM-DD' de HOY en zona LOCAL (no UTC): toISOString() daría el día UTC y en
// RD (UTC-4) saltaría a "mañana" de noche. Default para inputs type="date".
export function today() {
  const d = new Date()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

// Garantía: el backend habla MESES; el usuario ve/escribe AÑOS. La conversión vive
// solo en el front (reutilizable; Garantías también la usará).
export function yearsToMonths(years) {
  return Math.round(Number(years || 0) * 12)
}

export function monthsToYears(months) {
  return Number(months || 0) / 12
}

// "120 meses" -> "10 años"; "30" -> "2.5 años". No redondea de forma que pierda el dato.
export function formatWarranty(months) {
  const y = monthsToYears(months)
  const text = Number.isInteger(y) ? String(y) : String(Number(y.toFixed(2)))
  return `${text} ${y === 1 ? 'año' : 'años'}`
}

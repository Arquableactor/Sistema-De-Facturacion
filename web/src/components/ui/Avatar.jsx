// Avatar GENERADO a partir del nombre: iniciales sobre un color estable derivado del
// texto (estilo Gmail/Slack). NO hay fotos de clientes en el backend (no existe campo
// ni subida de archivos); si algún día se quieren, sería otra feature con backend.
// Reutilizable para clientes, usuarios o cualquier entidad con nombre.

// Paleta alineada a los tokens del handoff. Cada entrada es [fondo, texto]: siempre
// `*-soft` de fondo con su `*-strong` de texto, que es el par con contraste suficiente
// en ambos temas (el token DEFAULT es demasiado claro para texto sobre el soft).
const PALETTE = [
  ['bg-primary-soft', 'text-primary'],
  ['bg-green-soft', 'text-green-strong'],
  ['bg-amber-soft', 'text-amber-strong'],
  ['bg-purple-soft', 'text-purple-strong'],
  ['bg-orange-soft', 'text-orange-strong'],
  ['bg-danger-soft', 'text-danger-strong'],
]

const SIZES = {
  sm: 'h-7 w-7 text-[10px]',
  md: 'h-9 w-9 text-xs',
  lg: 'h-12 w-12 text-sm',
}

// Hash determinista (djb2): el mismo nombre siempre da el mismo color.
function hash(text) {
  let h = 5381
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0
  return Math.abs(h)
}

// Iniciales: primera letra de las dos primeras palabras "reales".
export function initials(name) {
  const words = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
  if (words.length === 0) return '?'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

export default function Avatar({ name, size = 'md', className = '' }) {
  const text = String(name || '').trim()
  const [bg, fg] = PALETTE[hash(text || '?') % PALETTE.length]

  return (
    <span
      // El nombre completo ya se muestra al lado; el avatar es decorativo.
      aria-hidden="true"
      title={text || undefined}
      className={`inline-grid shrink-0 place-items-center rounded-full font-semibold ${bg} ${fg} ${
        SIZES[size] || SIZES.md
      } ${className}`}
    >
      {initials(text)}
    </span>
  )
}

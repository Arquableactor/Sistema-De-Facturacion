import { useState } from 'react'

// Texto largo -> truncado con "…", completo al pasar el mouse (title) y al hacer click
// (alterna). Genérico: sirve para nombres de proyecto, notas, direcciones, etc.
// Truncamos en JS (no con CSS) porque el requisito es por CANTIDAD DE CARACTERES.
export const TRUNCATE_LIMIT = 25

// Corta a `limit` caracteres y agrega "…". Recorta el espacio final para no dejar " …".
export function truncate(text, limit = TRUNCATE_LIMIT) {
  const value = String(text ?? '')
  if (value.length <= limit) return value
  return value.slice(0, limit).trimEnd() + '…'
}

export function isTruncated(text, limit = TRUNCATE_LIMIT) {
  return String(text ?? '').length > limit
}

// `as` permite renderizarlo como span (por defecto) u otro elemento inline.
// `expandOnClick=false` para usarlo DENTRO de un enlace: ahí el click debe navegar, y
// un toggle propio se comería el click (además de ser anidamiento interactivo inválido).
// En ese caso queda como texto simple con el completo en el tooltip.
export default function TruncatedText({
  text,
  limit = TRUNCATE_LIMIT,
  className = '',
  as: Tag = 'span',
  expandOnClick = true,
}) {
  const [expanded, setExpanded] = useState(false)
  const value = String(text ?? '')
  const long = isTruncated(value, limit)

  if (!long) return <Tag className={className}>{value}</Tag>

  if (!expandOnClick) {
    return (
      <Tag title={value} className={className}>
        {truncate(value, limit)}
      </Tag>
    )
  }

  return (
    <Tag
      // Es un toggle real: por eso lleva rol de botón y responde a teclado.
      role="button"
      tabIndex={0}
      aria-expanded={expanded}
      title={value}
      onClick={(e) => {
        e.stopPropagation() // no dispara el click de la fila/enlace que lo contenga
        e.preventDefault()
        setExpanded((v) => !v)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.stopPropagation()
          e.preventDefault()
          setExpanded((v) => !v)
        }
      }}
      className={`cursor-pointer rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${className}`}
    >
      {expanded ? value : truncate(value, limit)}
    </Tag>
  )
}

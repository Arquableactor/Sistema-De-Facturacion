// Spinner reutilizable. `block` lo centra en un bloque (para estados de carga de página).
export default function Spinner({ size = 18, block = false, className = '' }) {
  const ring = (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-edge border-t-primary ${className}`}
      style={{ width: size, height: size }}
    />
  )
  if (!block) return ring
  return <div className="grid w-full place-items-center py-16">{ring}</div>
}

import Spinner from '../ui/Spinner.jsx'
import Button from '../ui/Button.jsx'

// Decide qué pintar según el estado de carga: cargando / error+reintentar / vacío / contenido.
// Reutilizable por cualquier página de lista.
export default function DataState({
  loading,
  error,
  empty,
  onRetry,
  emptyText = 'No hay datos aún.',
  children,
}) {
  if (loading) return <Spinner block />

  if (error) {
    return (
      <div className="grid place-items-center rounded-card border border-edge bg-surface py-16 text-center">
        <div>
          <p className="text-sm font-semibold text-danger-strong">
            {error.message || 'Ocurrió un error al cargar.'}
          </p>
          {onRetry && (
            <Button variant="ghost" className="mt-3" onClick={onRetry}>
              Reintentar
            </Button>
          )}
        </div>
      </div>
    )
  }

  if (empty) {
    return (
      <div className="grid place-items-center rounded-card border border-dashed border-edge bg-surface py-16 text-center text-sm text-muted">
        {emptyText}
      </div>
    )
  }

  return children
}

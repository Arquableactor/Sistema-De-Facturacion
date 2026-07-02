// Metadatos de presentación de proyecto, compartidos entre la tabla (ProjectsPage)
// y la pantalla de detalle (ProjectDetailPage) para no duplicar colores ni la barra.

export const STAGE = {
  Visita: { label: 'Visita', tone: 'gray' },
  Diseno: { label: 'Diseño', tone: 'blue' },
  Permisos: { label: 'Permisos', tone: 'purple' },
  Montaje: { label: 'Montaje', tone: 'amber' },
  Conexion: { label: 'Conexión', tone: 'orange' },
  Finalizado: { label: 'Finalizado', tone: 'green' },
}

export function stageMeta(etapa) {
  return STAGE[etapa] || { label: etapa, tone: 'gray' }
}

export function ProgressBar({ value, width = 'w-20' }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0))
  return (
    <div className="flex items-center gap-2">
      <div className={`h-1.5 ${width} overflow-hidden rounded-full bg-edge`}>
        <div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} />
      </div>
      <span className="tabular text-xs text-muted">{v}%</span>
    </div>
  )
}

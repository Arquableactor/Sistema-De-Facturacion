import useApi from '../../hooks/useApi.js'
import Badge from '../../components/ui/Badge.jsx'
import { getNcfEstado } from '../../api/ncfSequencesApi.js'
import { estadoMensaje, worstSeveridad, SEV_META } from '../../lib/ncfMeta.js'

// Avisos de NCF, compartidos entre el Dashboard y Facturación. Los ve Admin y Facturación
// (quien los monte debe estar autorizado — ver `ncf.viewStatus`). Solo INFORMAN: no
// administran. El cálculo de severidad viene del backend (/estado).

// Tarjeta para el Dashboard: discreta si todo va bien, con color si hay advertencia/crítico.
export function NcfStatusCard() {
  const { data, loading, error } = useApi(() => getNcfEstado(), [])
  if (loading || error || !data || data.length === 0) return null

  const worst = worstSeveridad(data)
  const sev = SEV_META[worst] || SEV_META.ok
  const borderCls =
    worst === 'critico'
      ? 'border-danger/40'
      : worst === 'advertencia'
        ? 'border-amber/40'
        : 'border-edge'

  return (
    <div className={`rounded-card border ${borderCls} bg-surface p-5 shadow-card`}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="font-display text-base font-semibold text-brand-text">
          Comprobantes fiscales (NCF)
        </h2>
        <Badge tone={sev.badge}>{sev.label}</Badge>
      </div>
      <ul className="space-y-1.5">
        {data.map((it) => (
          <li key={it.type} className="text-sm text-muted">
            {estadoMensaje(it)}
          </li>
        ))}
      </ul>
      {worst !== 'ok' && (
        <p className="mt-3 text-xs text-muted">
          Solicita una nueva secuencia a la DGII y regístrala en Configuración.
        </p>
      )}
    </div>
  )
}

// Banner para Facturación: SOLO si hay severidad crítica (no saturar con avisos permanentes).
export function NcfAlertBanner() {
  const { data } = useApi(() => getNcfEstado(), [])
  const criticos = (data || []).filter((it) => it.severidad === 'critico')
  if (criticos.length === 0) return null

  return (
    <div className="rounded-card border border-danger/40 bg-danger-soft px-4 py-3">
      <div className="flex items-start gap-2.5">
        <AlertIcon />
        <div className="min-w-0 text-sm">
          <p className="font-semibold text-danger-strong">Secuencia de NCF crítica</p>
          <ul className="mt-0.5 space-y-0.5 text-danger-strong">
            {criticos.map((it) => (
              <li key={it.type}>{estadoMensaje(it)}</li>
            ))}
          </ul>
          <p className="mt-1 text-danger-strong/90">
            Solicita una nueva secuencia a la DGII y regístrala en Configuración para poder
            seguir emitiendo.
          </p>
        </div>
      </div>
    </div>
  )
}

function AlertIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-0.5 shrink-0 text-danger-strong"
    >
      <path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  )
}

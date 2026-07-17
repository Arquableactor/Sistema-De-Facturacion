import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import { date, phone as fmtPhone } from '../lib/format.js'
import { getSolicitudes } from '../api/solicitudesApi.js'
import { estadoMeta, docLabel, ESTADO_FILTERS } from './solicitudes/solicitudMeta.js'
import SolicitudDetailModal from './solicitudes/SolicitudDetailModal.jsx'
import AprobarModal from './solicitudes/AprobarModal.jsx'
import RechazarModal from './solicitudes/RechazarModal.jsx'

// Bandeja de captación: ver, aprobar (crea Cliente) y rechazar las solicitudes que
// entran por el formulario público. Admin y Facturación.
export default function SolicitudesPage() {
  const toast = useToast()
  const { can } = useAuth()
  const canManage = can('solicitudes.manage')

  const [estado, setEstado] = useState('')
  const [search, setSearch] = useState('')
  const { data, loading, error, reload } = useApi(
    () => getSolicitudes({ estado: estado || undefined, search: search.trim() || undefined }),
    [estado, search],
  )

  const [detalleId, setDetalleId] = useState(null)
  const [aprobando, setAprobando] = useState(null) // la solicitud (objeto)
  const [rechazando, setRechazando] = useState(null)

  const solicitudes = data || []

  function onAprobada(result) {
    setAprobando(null)
    setDetalleId(null)
    reload()
    toast.success(
      result?.clienteCreadoId
        ? `Cliente creado (#${result.clienteCreadoId}).`
        : 'Solicitud aprobada.',
    )
  }

  function onRechazada() {
    setRechazando(null)
    setDetalleId(null)
    reload()
    toast.success('Solicitud rechazada.')
  }

  return (
    <>
      <Topbar title="Solicitudes" subtitle="Evaluaciones solicitadas desde el formulario público" />

      <div className="space-y-4 p-6">
        {/* Toolbar: contador + filtro de estado + búsqueda */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${solicitudes.length} solicitud${solicitudes.length === 1 ? '' : 'es'}`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o documento…"
              aria-label="Buscar solicitudes"
              className="w-64 rounded-btn border border-edge bg-surface px-3.5 py-2 text-sm text-brand-text outline-none placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <label className="flex items-center gap-2 text-sm text-muted">
              Estado
              <select
                value={estado}
                onChange={(e) => setEstado(e.target.value)}
                className="rounded-btn border border-edge bg-surface px-3 py-2 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
              >
                {ESTADO_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={solicitudes.length === 0}
          onRetry={reload}
          emptyText={
            search || estado
              ? 'Ninguna solicitud coincide con el filtro.'
              : 'No hay solicitudes todavía. Llegan desde el formulario público /solicitud.'
          }
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">N°</th>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Documento</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Ubicación</th>
                    <th className="px-4 py-3 text-right font-semibold">Consumo</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {solicitudes.map((s) => {
                    const est = estadoMeta(s.estado)
                    return (
                      <tr
                        key={s.id}
                        className="cursor-pointer border-t border-edge hover:bg-edge-soft/40"
                        onClick={() => setDetalleId(s.id)}
                      >
                        <td className="px-4 py-3 font-mono text-xs text-muted">{s.numeroSolicitud}</td>
                        <td className="px-4 py-3 font-medium text-brand-text">{s.nombre}</td>
                        <td className="px-4 py-3 text-muted">
                          <span className="text-faint">{docLabel(s.documentType)}</span> {s.documentNumber}
                        </td>
                        <td className="px-4 py-3 text-muted">{fmtPhone(s.phone)}</td>
                        <td className="max-w-[200px] truncate px-4 py-3 text-muted" title={s.ubicacion}>
                          {s.ubicacion}
                        </td>
                        <td className="px-4 py-3 text-right tabular text-muted">
                          {s.consumoEstimadoKwhDia} kWh/día
                        </td>
                        <td className="px-4 py-3 text-muted">{date(s.createdAt)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={est.tone}>{est.label}</Badge>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button
                            variant="ghost"
                            className="px-2.5 py-1.5"
                            onClick={(e) => {
                              e.stopPropagation()
                              setDetalleId(s.id)
                            }}
                          >
                            Ver
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DataState>
      </div>

      <SolicitudDetailModal
        open={detalleId != null}
        solicitudId={detalleId}
        canManage={canManage}
        onClose={() => setDetalleId(null)}
        onAprobar={(s) => setAprobando(s)}
        onRechazar={(s) => setRechazando(s)}
      />

      <AprobarModal
        open={aprobando != null}
        solicitud={aprobando}
        onClose={() => setAprobando(null)}
        onAprobada={onAprobada}
        onRechazarEnVez={() => {
          const s = aprobando
          setAprobando(null)
          setRechazando(s)
        }}
      />

      <RechazarModal
        open={rechazando != null}
        solicitud={rechazando}
        onClose={() => setRechazando(null)}
        onRechazada={onRechazada}
      />
    </>
  )
}

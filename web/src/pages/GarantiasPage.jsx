import { useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Spinner from '../components/ui/Spinner.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { date } from '../lib/format.js'
import { getWarranties, searchBySerial, downloadWarrantyPdf } from '../api/warrantiesApi.js'
import { warrantyStatusMeta } from './warranties/warrantyMeta.js'

export default function GarantiasPage() {
  const toast = useToast()

  // Búsqueda por serial: estado propio, se dispara al buscar (no al montar).
  const [serial, setSerial] = useState('')
  const [search, setSearch] = useState({ state: 'idle', results: [], error: '', term: '' })

  // Lista general.
  const { data, loading, error, reload } = useApi(() => getWarranties(), [])
  const warranties = data || []
  const [downloadingId, setDownloadingId] = useState(null)

  async function onSearch(e) {
    e.preventDefault()
    const term = serial.trim()
    if (!term) return
    setSearch({ state: 'loading', results: [], error: '', term })
    try {
      const results = await searchBySerial(term)
      setSearch({ state: 'found', results: results || [], error: '', term })
    } catch (err) {
      if (err.status === 404) {
        setSearch({ state: 'empty', results: [], error: '', term })
      } else {
        setSearch({ state: 'error', results: [], error: err.message || 'Error al buscar.', term })
      }
    }
  }

  async function onPdf(w) {
    setDownloadingId(w.id)
    try {
      await downloadWarrantyPdf(w.id, w.warrantyNumber)
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el certificado.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <Topbar title="Garantías" subtitle="Certificados de garantía por proyecto" />

      <div className="space-y-6 p-6">
        {/* Búsqueda por número de serie */}
        <div className="rounded-card border border-edge bg-surface p-5 shadow-card">
          <h2 className="font-display text-sm font-semibold text-brand-text">
            Buscar garantía por equipo
          </h2>
          <form onSubmit={onSearch} className="mt-3 flex gap-2">
            <input
              value={serial}
              onChange={(e) => setSerial(e.target.value)}
              placeholder="Buscar por número de serie…"
              className="w-full max-w-md rounded-btn border border-edge bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            />
            <Button type="submit" loading={search.state === 'loading'}>
              Buscar
            </Button>
          </form>
          <p className="mt-1.5 text-xs text-faint">La búsqueda distingue mayúsculas y minúsculas.</p>

          {/* Resultado de la búsqueda */}
          {search.state === 'loading' && <Spinner block />}

          {search.state === 'empty' && (
            <div className="mt-4 rounded-btn bg-edge-soft px-4 py-3 text-sm text-muted">
              Ningún equipo con el número de serie «{search.term}» tiene garantía.
            </div>
          )}

          {search.state === 'error' && (
            <div className="mt-4 rounded-btn bg-danger-soft px-4 py-3 text-sm text-danger-strong">
              {search.error}
            </div>
          )}

          {search.state === 'found' && (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {search.results.map((w) => {
                const matched = (w.items || []).find((i) => i.serialNumber === search.term)
                const st = warrantyStatusMeta(w.status)
                return (
                  <div key={w.id} className="rounded-card border border-edge p-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-display text-base font-semibold text-brand-text">
                        {w.warrantyNumber}
                      </span>
                      <Badge tone={st.tone}>{st.label}</Badge>
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      Vigencia: {date(w.startDate)} → {date(w.endDate)}
                    </div>
                    {matched && (
                      <div className="mt-2 rounded-btn bg-edge-soft px-3 py-2 text-xs text-muted">
                        Equipo: {[matched.marca, matched.modelo].filter(Boolean).join(' · ') || '—'} ·{' '}
                        <span className="font-mono">{matched.serialNumber}</span>
                      </div>
                    )}
                    <div className="mt-3">
                      <Link
                        to={`/proyectos/${w.projectId}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Ver proyecto →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Lista general */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted">
              {loading ? 'Cargando…' : `${warranties.length} garantía${warranties.length === 1 ? '' : 's'}`}
            </p>
            <p className="text-xs text-faint">Las garantías se generan desde el proyecto.</p>
          </div>

          <DataState
            loading={loading}
            error={error}
            empty={warranties.length === 0}
            onRetry={reload}
            emptyText="No hay garantías generadas aún."
          >
            <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-4 py-3 font-semibold">Garantía</th>
                      <th className="px-4 py-3 font-semibold">Cliente</th>
                      <th className="px-4 py-3 font-semibold">Proyecto</th>
                      <th className="px-4 py-3 font-semibold">Vigencia</th>
                      <th className="px-4 py-3 text-right font-semibold">Equipos</th>
                      <th className="px-4 py-3 font-semibold">Estado</th>
                      <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {warranties.map((w) => {
                      const st = warrantyStatusMeta(w.status)
                      return (
                        <tr key={w.id} className="border-t border-edge hover:bg-edge-soft/40">
                          <td className="px-4 py-3 font-medium text-brand-text">{w.warrantyNumber}</td>
                          <td className="px-4 py-3 text-muted">{w.clientName}</td>
                          <td className="px-4 py-3 text-muted">{w.projectNombre}</td>
                          <td className="px-4 py-3 text-muted">
                            {date(w.startDate)} → {date(w.endDate)}
                          </td>
                          <td className="px-4 py-3 text-right tabular text-muted">{w.itemCount}</td>
                          <td className="px-4 py-3">
                            <Badge tone={st.tone}>{st.label}</Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                variant="ghost"
                                className="px-2.5 py-1.5"
                                loading={downloadingId === w.id}
                                onClick={() => onPdf(w)}
                              >
                                PDF
                              </Button>
                              <Link
                                to={`/proyectos/${w.projectId}`}
                                className="rounded-btn px-2.5 py-1.5 text-sm font-medium text-primary hover:bg-primary-soft"
                              >
                                Proyecto
                              </Link>
                            </div>
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
      </div>
    </>
  )
}

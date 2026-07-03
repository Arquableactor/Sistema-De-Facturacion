import { useMemo, useState } from 'react'
import Button from '../../components/ui/Button.jsx'
import Badge from '../../components/ui/Badge.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import useApi from '../../hooks/useApi.js'
import { date, formatWarranty } from '../../lib/format.js'
import { getWarranties, getWarranty, downloadWarrantyPdf } from '../../api/warrantiesApi.js'
import { warrantyStatusMeta } from './warrantyMeta.js'
import GenerateWarrantyModal from './GenerateWarrantyModal.jsx'

// Bloque de Garantía del proyecto con 3 estados (con garantía / sin garantía+equipos /
// sin equipos). La garantía se genera desde aquí; generar no toca equipos, así que solo
// recargamos la garantía.
export default function ProjectWarrantyBlock({ projectId, equiposCount }) {
  const toast = useToast()
  const { data: warranties, loading, error, reload } = useApi(
    () => getWarranties({ projectId }),
    [projectId],
  )
  const current = useMemo(
    () => (warranties || []).find((w) => w.status !== 'Void') || null,
    [warranties],
  )
  // Detalle (items cubiertos) de la garantía vigente.
  const {
    data: detail,
    error: detailError,
    reload: reloadDetail,
  } = useApi(() => (current ? getWarranty(current.id) : Promise.resolve(null)), [current?.id])

  const [genOpen, setGenOpen] = useState(false)
  const [downloading, setDownloading] = useState(false)

  function onGenerated() {
    setGenOpen(false)
    reload()
    toast.success('Garantía generada.')
  }

  async function onPdf() {
    setDownloading(true)
    try {
      await downloadWarrantyPdf(current.id, current.warrantyNumber)
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el certificado.')
    } finally {
      setDownloading(false)
    }
  }

  async function copyLink() {
    const url = `${window.location.origin}/api/public/verify/${current.verificationCode}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success('Link copiado.')
    } catch {
      toast.error('No se pudo copiar el link.')
    }
  }

  return (
    <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
      <div className="border-b border-edge px-6 py-4">
        <h2 className="font-display text-base font-semibold text-brand-text">Garantía</h2>
      </div>

      <div className="p-6">
        {loading ? (
          <Spinner block />
        ) : error ? (
          <InlineError message={error.message || 'No se pudo cargar la garantía.'} onRetry={reload} />
        ) : current ? (
          // ---- Estado 3: con garantía ----
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-lg font-semibold text-brand-text">
                  {current.warrantyNumber}
                </span>
                <Badge tone={warrantyStatusMeta(current.status).tone}>
                  {warrantyStatusMeta(current.status).label}
                </Badge>
              </div>
              <Button variant="ghost" loading={downloading} onClick={onPdf}>
                Descargar certificado
              </Button>
            </div>

            <div className="text-sm text-muted">
              Vigencia: <span className="text-brand-text">{date(current.startDate)}</span> →{' '}
              <span className="text-brand-text">{date(current.endDate)}</span>
            </div>

            {/* Equipos cubiertos (del detalle) */}
            <div>
              <div className="mb-2 text-xs font-medium uppercase tracking-wide text-faint">
                Equipos cubiertos
              </div>
              {detail ? (
                <div className="overflow-x-auto rounded-btn border border-edge">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-3 py-2 font-semibold">Marca / Modelo</th>
                        <th className="px-3 py-2 font-semibold">Nº de serie</th>
                        <th className="px-3 py-2 font-semibold">Garantía</th>
                        <th className="px-3 py-2 font-semibold">Vence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.items.map((it) => (
                        <tr key={it.id} className="border-t border-edge">
                          <td className="px-3 py-2 text-muted">
                            {[it.marca, it.modelo].filter(Boolean).join(' · ') || '—'}
                          </td>
                          <td className="px-3 py-2 font-mono text-xs text-muted">{it.serialNumber}</td>
                          <td className="px-3 py-2 text-muted">{formatWarranty(it.warrantyMonths)}</td>
                          <td className="px-3 py-2 text-muted">{date(it.endDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : detailError ? (
                <InlineError
                  message={detailError.message || 'No se pudieron cargar los equipos cubiertos.'}
                  onRetry={reloadDetail}
                />
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted">
                  <Spinner size={14} /> Cargando equipos cubiertos…
                </div>
              )}
            </div>

            {/* Código de verificación */}
            <div className="rounded-btn bg-edge-soft/60 p-3">
              <div className="text-xs font-medium uppercase tracking-wide text-faint">
                Código de verificación
              </div>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
                <code className="break-all font-mono text-xs text-brand-text">
                  {current.verificationCode}
                </code>
                <Button variant="ghost" className="px-2.5 py-1.5" onClick={copyLink}>
                  Copiar link de verificación
                </Button>
              </div>
              <p className="mt-1 text-xs text-faint">
                Link público que codifica el QR del certificado.
              </p>
            </div>
          </div>
        ) : equiposCount > 0 ? (
          // ---- Estado 1: sin garantía, con equipos ----
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">Este proyecto aún no tiene garantía.</p>
            <Button onClick={() => setGenOpen(true)}>Generar garantía</Button>
          </div>
        ) : (
          // ---- Estado 2: sin garantía, sin equipos ----
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              Registra equipos instalados para poder generar la garantía.
            </p>
            <Button disabled>Generar garantía</Button>
          </div>
        )}
      </div>

      <GenerateWarrantyModal
        open={genOpen}
        projectId={projectId}
        equiposCount={equiposCount}
        onClose={() => setGenOpen(false)}
        onGenerated={onGenerated}
      />
    </div>
  )
}

// Error inline con reintento (para no anidar el panel completo de DataState dentro del bloque).
function InlineError({ message, onRetry }) {
  return (
    <div className="text-center">
      <p className="text-sm font-semibold text-danger-strong">{message}</p>
      {onRetry && (
        <Button variant="ghost" className="mt-3" onClick={onRetry}>
          Reintentar
        </Button>
      )}
    </div>
  )
}

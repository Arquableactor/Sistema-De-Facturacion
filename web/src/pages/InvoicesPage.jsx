import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { money, date } from '../lib/format.js'
import { getInvoices, issueInvoice, downloadInvoicePdf } from '../api/invoicesApi.js'
import { getProjects } from '../api/projectsApi.js'
import { statusMeta } from './invoices/invoiceMeta.js'

const FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'Draft', label: 'Borrador' },
  { value: 'Issued', label: 'Emitida' },
  { value: 'PartiallyPaid', label: 'Parcial' },
  { value: 'Paid', label: 'Pagada' },
]

export default function InvoicesPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [status, setStatus] = useState('')

  const { data, loading, error, reload } = useApi(
    () => getInvoices({ status: status || undefined }),
    [status],
  )
  // Los nombres de proyecto no vienen en la lista de facturas: los resolvemos por Id
  // (incluye inactivos para no dejar huecos en facturas viejas).
  const { data: projects } = useApi(() => getProjects(true), [])
  const projectName = useMemo(
    () => new Map((projects || []).map((p) => [p.id, p.nombre])),
    [projects],
  )

  const [toEmit, setToEmit] = useState(null)
  const [emitting, setEmitting] = useState(false)
  const [downloadingId, setDownloadingId] = useState(null)

  const invoices = data || []

  async function confirmEmit() {
    setEmitting(true)
    try {
      await issueInvoice(toEmit.id)
      toast.success('Factura emitida (NCF asignado).')
      setToEmit(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'No se pudo emitir.')
    } finally {
      setEmitting(false)
    }
  }

  async function onPdf(inv) {
    setDownloadingId(inv.id)
    try {
      await downloadInvoicePdf(inv.id, inv.invoiceNumber)
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el PDF.')
    } finally {
      setDownloadingId(null)
    }
  }

  return (
    <>
      <Topbar
        title="Facturación"
        subtitle="Facturas de los proyectos"
        action={<Button onClick={() => navigate('/facturacion/nueva')}>+ Nueva factura</Button>}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${invoices.length} factura${invoices.length === 1 ? '' : 's'}`}
          </p>
          <label className="flex items-center gap-2 text-sm text-muted">
            Estado
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-btn border border-edge bg-white px-3 py-2 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            >
              {FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={invoices.length === 0}
          onRetry={reload}
          emptyText="No hay facturas. Crea la primera con «Nueva factura»."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nº</th>
                    <th className="px-4 py-3 font-semibold">NCF</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Proyecto</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Vence</th>
                    <th className="px-4 py-3 text-right font-semibold">Total</th>
                    <th className="px-4 py-3 text-right font-semibold">Balance</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => {
                    const st = statusMeta(inv.status)
                    return (
                      <tr key={inv.id} className="border-t border-edge hover:bg-edge-soft/40">
                        <td className="px-4 py-3 font-medium">
                          <Link to={`/facturacion/${inv.id}`} className="text-primary hover:underline">
                            {inv.invoiceNumber}
                          </Link>
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">{inv.ncf || '—'}</td>
                        <td className="px-4 py-3 text-muted">{inv.clientName}</td>
                        <td className="px-4 py-3 text-muted">
                          {projectName.get(inv.projectId) || `#${inv.projectId}`}
                        </td>
                        <td className="px-4 py-3 text-muted">{date(inv.date)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={inv.isOverdue ? 'font-semibold text-danger-strong' : 'text-muted'}
                            title={inv.isOverdue ? 'Vencida' : undefined}
                          >
                            {date(inv.dueDate)}
                            {inv.isOverdue && ' · Vencida'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right tabular text-brand-text">{money(inv.total)}</td>
                        <td className="px-4 py-3 text-right tabular text-muted">{money(inv.balance)}</td>
                        <td className="px-4 py-3">
                          <Badge tone={st.tone}>{st.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            {inv.status === 'Draft' && (
                              <Button
                                variant="ghost"
                                className="px-2.5 py-1.5 text-primary hover:bg-primary-soft"
                                onClick={() => setToEmit(inv)}
                              >
                                Emitir
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1.5"
                              loading={downloadingId === inv.id}
                              onClick={() => onPdf(inv)}
                            >
                              PDF
                            </Button>
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

      <ConfirmDialog
        open={!!toEmit}
        title="Emitir factura"
        message={`Se asignará un NCF fiscal a «${toEmit?.invoiceNumber}». Esta acción no se puede deshacer.`}
        confirmText="Emitir"
        tone="primary"
        loading={emitting}
        onConfirm={confirmEmit}
        onCancel={() => !emitting && setToEmit(null)}
      />
    </>
  )
}

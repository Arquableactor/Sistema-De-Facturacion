import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import { money, date } from '../lib/format.js'
import { getInvoice, issueInvoice, downloadInvoicePdf } from '../api/invoicesApi.js'
import { getPayments } from '../api/paymentsApi.js'
import { getProjects } from '../api/projectsApi.js'
import { statusMeta, methodLabel } from './invoices/invoiceMeta.js'
import PaymentFormModal from './invoices/PaymentFormModal.jsx'
import VoidPaymentModal from './invoices/VoidPaymentModal.jsx'

function Info({ label, value, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-sm text-brand-text">{children ?? value}</div>
    </div>
  )
}

export default function InvoiceDetailPage() {
  const { id } = useParams()
  const toast = useToast()
  const { can } = useAuth()
  const canIssue = can('invoices.issue')
  const canRegisterPayment = can('payments.register')
  const canVoid = can('payments.void')

  const { data: invoice, loading, error, reload: reloadInvoice } = useApi(() => getInvoice(id), [id])
  const {
    data: payments,
    loading: payLoading,
    error: payError,
    reload: reloadPayments,
  } = useApi(() => getPayments(id), [id])
  const { data: projects } = useApi(() => getProjects(true), [])
  const projectName = useMemo(
    () => new Map((projects || []).map((p) => [p.id, p.nombre])),
    [projects],
  )

  const [emitOpen, setEmitOpen] = useState(false)
  const [issuing, setIssuing] = useState(false)
  const [payOpen, setPayOpen] = useState(false)
  const [voidTarget, setVoidTarget] = useState(null)
  const [downloadingPdf, setDownloadingPdf] = useState(false)

  const list = payments || []

  async function confirmIssue() {
    setIssuing(true)
    try {
      await issueInvoice(id)
      toast.success('Factura emitida (NCF asignado).')
      setEmitOpen(false)
      reloadInvoice()
    } catch (err) {
      toast.error(err.message || 'No se pudo emitir.')
    } finally {
      setIssuing(false)
    }
  }

  async function onPdf() {
    setDownloadingPdf(true)
    try {
      await downloadInvoicePdf(id, invoice.invoiceNumber)
    } catch (err) {
      toast.error(err.message || 'No se pudo descargar el PDF.')
    } finally {
      setDownloadingPdf(false)
    }
  }

  function onPaymentSaved() {
    setPayOpen(false)
    reloadInvoice()
    reloadPayments()
    toast.success('Pago registrado.')
  }

  function onVoided() {
    setVoidTarget(null)
    reloadInvoice()
    reloadPayments()
    toast.success('Pago anulado.')
  }

  return (
    <>
      <Topbar
        title="Detalle de factura"
        subtitle="Factura y cobros"
        action={
          <Link
            to="/facturacion"
            className="inline-flex items-center rounded-btn px-3 py-2 text-sm font-medium text-muted hover:bg-edge-soft"
          >
            ← Facturación
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        <DataState loading={loading} error={error} empty={false} onRetry={reloadInvoice}>
          {invoice && (
            <>
              {/* Cabecera */}
              <div className="rounded-card border border-edge bg-surface p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="font-display text-2xl font-semibold text-brand-text">
                        {invoice.invoiceNumber}
                      </h1>
                      <Badge tone={statusMeta(invoice.status).tone}>
                        {statusMeta(invoice.status).label}
                      </Badge>
                      {invoice.isOverdue && <Badge tone="red">Vencida</Badge>}
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      {invoice.ncf ? `NCF: ${invoice.ncf}` : 'Sin NCF — Borrador'}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    {invoice.status === 'Draft' && canIssue && (
                      <Button
                        variant="ghost"
                        className="text-primary hover:bg-primary-soft"
                        onClick={() => setEmitOpen(true)}
                      >
                        Emitir
                      </Button>
                    )}
                    <Button variant="ghost" loading={downloadingPdf} onClick={onPdf}>
                      PDF{invoice.status === 'Draft' ? ' (borrador)' : ''}
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-4">
                  <Info label="Cliente" value={invoice.clientName} />
                  <Info label="Proyecto" value={projectName.get(invoice.projectId) || `#${invoice.projectId}`} />
                  <Info label="Fecha" value={date(invoice.date)} />
                  <Info label="Vencimiento">
                    <span className={invoice.isOverdue ? 'font-semibold text-danger-strong' : undefined}>
                      {date(invoice.dueDate)}
                    </span>
                  </Info>
                </div>

                {invoice.notes && (
                  <div className="mt-5 border-t border-edge pt-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-faint">Notas</div>
                    <p className="mt-1 text-sm text-muted">{invoice.notes}</p>
                  </div>
                )}
              </div>

              {/* Líneas */}
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
                <div className="border-b border-edge px-6 py-4">
                  <h2 className="font-display text-base font-semibold text-brand-text">Líneas</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Descripción</th>
                        <th className="px-4 py-3 text-right font-semibold">Cant.</th>
                        <th className="px-4 py-3 text-right font-semibold">Precio unit.</th>
                        <th className="px-4 py-3 text-right font-semibold">Desc.</th>
                        <th className="px-4 py-3 text-right font-semibold">ITBIS</th>
                        <th className="px-4 py-3 text-right font-semibold">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.items.map((it) => (
                        <tr key={it.id} className="border-t border-edge">
                          <td className="px-4 py-3 text-brand-text">{it.description}</td>
                          <td className="px-4 py-3 text-right tabular text-muted">{it.quantity}</td>
                          <td className="px-4 py-3 text-right tabular text-muted">{money(it.unitPrice)}</td>
                          <td className="px-4 py-3 text-right tabular text-muted">{money(it.discount)}</td>
                          <td className="px-4 py-3 text-right tabular text-muted">{money(it.itbis)}</td>
                          <td className="px-4 py-3 text-right tabular text-brand-text">{money(it.lineTotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="flex justify-end border-t border-edge bg-edge-soft/40 px-6 py-4">
                  <div className="w-64 space-y-1.5 text-sm">
                    <TotalRow label="Subtotal" value={money(invoice.subtotal)} />
                    <TotalRow label="ITBIS (18%)" value={money(invoice.itbis)} />
                    <TotalRow label="Descuento" value={money(invoice.discount)} />
                    <div className="border-t border-edge pt-1.5">
                      <TotalRow label="Total" value={money(invoice.total)} bold />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resumen de cobro */}
              <div className="grid gap-4 rounded-card border border-edge bg-surface p-6 shadow-card sm:grid-cols-3">
                <Money label="Total" value={invoice.total} />
                <Money label="Pagado" value={invoice.paidAmount} tone="green" />
                <Money label="Balance" value={invoice.balance} tone={invoice.balance > 0 ? 'amber' : 'muted'} />
              </div>

              {/* Pagos */}
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
                <div className="flex items-center justify-between gap-4 border-b border-edge px-6 py-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-brand-text">Pagos</h2>
                    <p className="text-sm text-muted">
                      {payLoading ? 'Cargando…' : `${list.length} pago${list.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <PayAction
                    status={invoice.status}
                    canRegister={canRegisterPayment}
                    canIssue={canIssue}
                    onRegister={() => setPayOpen(true)}
                    onEmit={() => setEmitOpen(true)}
                  />
                </div>

                <div className="p-6">
                  <DataState
                    loading={payLoading}
                    error={payError}
                    empty={list.length === 0}
                    onRetry={reloadPayments}
                    emptyText="Sin pagos registrados."
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Fecha</th>
                            <th className="px-4 py-3 text-right font-semibold">Monto</th>
                            <th className="px-4 py-3 font-semibold">Método</th>
                            <th className="px-4 py-3 font-semibold">Referencia</th>
                            <th className="px-4 py-3 font-semibold">Notas</th>
                            <th className="px-4 py-3 font-semibold">Estado</th>
                            <th className="px-4 py-3 text-right font-semibold">Acción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((p) => (
                            <tr
                              key={p.id}
                              className={`border-t border-edge ${p.isVoided ? 'text-faint' : ''}`}
                            >
                              <td className="px-4 py-3">{date(p.paidAt)}</td>
                              <td
                                className={`px-4 py-3 text-right tabular ${
                                  p.isVoided ? 'line-through' : 'text-brand-text'
                                }`}
                              >
                                {money(p.amount)}
                              </td>
                              <td className="px-4 py-3">{methodLabel(p.paymentMethod)}</td>
                              <td className="px-4 py-3">{p.reference || '—'}</td>
                              <td className="px-4 py-3">{p.notes || '—'}</td>
                              <td className="px-4 py-3">
                                {p.isVoided ? (
                                  <span title={p.voidReason || undefined}>
                                    <Badge tone="red">Anulado</Badge>
                                    {p.voidReason && (
                                      <span className="ml-2 text-xs text-faint">{p.voidReason}</span>
                                    )}
                                  </span>
                                ) : (
                                  <Badge tone="green">Vigente</Badge>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {!p.isVoided && canVoid && (
                                  <Button
                                    variant="ghost"
                                    className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                                    onClick={() => setVoidTarget(p)}
                                  >
                                    Anular
                                  </Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DataState>
                </div>
              </div>

              {/* Modales */}
              <PaymentFormModal
                open={payOpen}
                invoiceId={invoice.id}
                balance={invoice.balance}
                onClose={() => setPayOpen(false)}
                onSaved={onPaymentSaved}
              />
              <VoidPaymentModal
                open={!!voidTarget}
                payment={voidTarget}
                onClose={() => setVoidTarget(null)}
                onVoided={onVoided}
              />
              <ConfirmDialog
                open={emitOpen}
                title="Emitir factura"
                message={`Se asignará un NCF fiscal a «${invoice.invoiceNumber}». Esta acción no se puede deshacer.`}
                confirmText="Emitir"
                tone="primary"
                loading={issuing}
                onConfirm={confirmIssue}
                onCancel={() => !issuing && setEmitOpen(false)}
              />
            </>
          )}
        </DataState>

        {error && (
          <div className="text-center">
            <Link to="/facturacion" className="text-sm font-medium text-primary hover:underline">
              ← Volver a la lista de facturas
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

function TotalRow({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-brand-text' : 'text-muted'}>{label}</span>
      <span className={`tabular ${bold ? 'font-semibold text-brand-text' : 'text-muted'}`}>{value}</span>
    </div>
  )
}

const MONEY_TONE = {
  green: 'text-green-strong',
  amber: 'text-amber-strong',
  muted: 'text-muted',
}

function Money({ label, value, tone }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-1 font-display text-xl font-semibold tabular ${MONEY_TONE[tone] || 'text-brand-text'}`}>
        {money(value)}
      </div>
    </div>
  )
}

// Acción de la sección de pagos según el estado de la factura y los permisos del rol.
function PayAction({ status, canRegister, canIssue, onRegister, onEmit }) {
  if (status === 'Issued' || status === 'PartiallyPaid') {
    return canRegister ? <Button onClick={onRegister}>+ Registrar pago</Button> : null
  }
  if (status === 'Draft') {
    return (
      <div className="flex items-center gap-3 text-sm text-muted">
        <span>Emite la factura para poder registrar pagos</span>
        {canIssue && (
          <Button variant="ghost" className="text-primary hover:bg-primary-soft" onClick={onEmit}>
            Emitir
          </Button>
        )}
      </div>
    )
  }
  if (status === 'Paid') {
    return <span className="text-sm font-medium text-green-strong">Factura saldada</span>
  }
  return <span className="text-sm text-muted">Factura anulada</span>
}

import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { money } from '../../lib/format.js'
import { voidPayment } from '../../api/paymentsApi.js'

// Anulación (lógica) de un pago, con motivo opcional. La factura recalcula su estado.
export default function VoidPaymentModal({ open, payment, onClose, onVoided }) {
  const [reason, setReason] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setReason('')
    setFormError('')
  }, [open])

  async function onConfirm() {
    setSubmitting(true)
    setFormError('')
    try {
      await voidPayment(payment.id, reason)
      onVoided()
    } catch (err) {
      // 409 = ya anulado -> message del server.
      setFormError(err.message || 'No se pudo anular el pago.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="sm"
      title="Anular pago"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={submitting}>
            Anular pago
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}
        <p className="text-sm text-muted">
          ¿Anular este pago de <span className="font-semibold text-brand-text">{money(payment?.amount)}</span>?
          La factura recalculará su balance y estado.
        </p>
        <Field id="voidReason" label="Motivo (opcional)">
          <textarea
            id="voidReason"
            rows={2}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-btn border border-edge bg-white px-3.5 py-2.5 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Ej. error de digitación"
          />
        </Field>
      </div>
    </Modal>
  )
}

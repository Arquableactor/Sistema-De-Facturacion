import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { money, today } from '../../lib/format.js'
import { mapDetails } from '../../lib/apiErrors.js'
import { createPayment } from '../../api/paymentsApi.js'
import { PAYMENT_METHODS } from './invoiceMeta.js'

const controlCls = (hasError) =>
  `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

// Registrar un pago contra una factura. El monto máximo es el balance pendiente:
// se valida en cliente (0 < amount <= balance) y el server es el respaldo (409).
export default function PaymentFormModal({ open, invoiceId, balance, onClose, onSaved }) {
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('Cash')
  const [reference, setReference] = useState('')
  const [paidAt, setPaidAt] = useState(today())
  const [notes, setNotes] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setPaymentMethod('Cash')
    setReference('')
    setPaidAt(today())
    setNotes('')
    setErrors({})
    setFormError('')
  }, [open])

  function validate() {
    const e = {}
    const n = Number(amount)
    if (amount === '' || Number.isNaN(n) || n <= 0) e.amount = 'El monto debe ser mayor que 0.'
    else if (n > balance) e.amount = `No puede superar el balance (${money(balance)}).`
    if (!paymentMethod) e.paymentMethod = 'Selecciona un método.'
    return e
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      // paidAt/reference/notes son opcionales: se OMITEN si están vacíos (nunca se
      // envía "" — el backend no puede parsear "" a DateTime? y daría un 400 crudo).
      const payload = { amount: Number(amount), paymentMethod }
      if (paidAt) payload.paidAt = paidAt
      const ref = reference.trim()
      if (ref) payload.reference = ref
      const nt = notes.trim()
      if (nt) payload.notes = nt
      await createPayment(invoiceId, payload)
      onSaved()
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else {
        // 409 = sobrepago o factura no pagable -> el message del server es claro.
        setFormError(err.message || 'No se pudo registrar el pago.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      title="Registrar pago"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="payment-form" loading={submitting}>
            Registrar pago
          </Button>
        </>
      }
    >
      <form id="payment-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <div className="rounded-btn bg-primary-soft px-3 py-2 text-sm text-primary">
          Balance pendiente: <span className="font-semibold">{money(balance)}</span>
        </div>

        <Field id="amount" label="Monto (RD$)" error={errors.amount}>
          <div className="flex gap-2">
            <input
              id="amount"
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={controlCls(errors.amount)}
              placeholder="0.00"
            />
            <Button type="button" variant="ghost" onClick={() => setAmount(String(balance))}>
              Pagar total
            </Button>
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="paymentMethod" label="Método" error={errors.paymentMethod}>
            <select
              id="paymentMethod"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className={controlCls(errors.paymentMethod)}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="paidAt"
            label="Fecha de pago"
            type="date"
            value={paidAt}
            onChange={(e) => setPaidAt(e.target.value)}
          />
        </div>

        <Field
          id="reference"
          label="Referencia (opcional)"
          value={reference}
          onChange={(e) => setReference(e.target.value)}
          placeholder="Nº de transferencia, cheque…"
        />

        <Field id="notes" label="Notas (opcional)">
          <textarea
            id="notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={controlCls(false)}
          />
        </Field>
      </form>
    </Modal>
  )
}

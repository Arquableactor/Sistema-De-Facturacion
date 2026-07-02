import { api } from './client.js'

// Pagos de una factura. El backend valida no-sobrepago y la anulación es lógica.
export function getPayments(invoiceId) {
  return api.get(`/api/invoices/${invoiceId}/payments`)
}

export function createPayment(invoiceId, data) {
  return api.post(`/api/invoices/${invoiceId}/payments`, data)
}

export function voidPayment(paymentId, reason) {
  const r = (reason || '').trim()
  return api.post(`/api/payments/${paymentId}/void`, { voidReason: r || null })
}

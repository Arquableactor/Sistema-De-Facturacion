// Metadatos de presentación de facturas/pagos, compartidos entre la lista y el detalle.

export const STATUS = {
  Draft: { label: 'Borrador', tone: 'gray' },
  Issued: { label: 'Emitida', tone: 'blue' },
  PartiallyPaid: { label: 'Parcial', tone: 'amber' },
  Paid: { label: 'Pagada', tone: 'green' },
  Cancelled: { label: 'Anulada', tone: 'red' },
}

export function statusMeta(status) {
  return STATUS[status] || { label: status, tone: 'gray' }
}

// El VALOR viaja como enum en inglés; la etiqueta es solo de presentación.
export const PAYMENT_METHODS = [
  { value: 'Cash', label: 'Efectivo' },
  { value: 'Transfer', label: 'Transferencia' },
  { value: 'Card', label: 'Tarjeta' },
  { value: 'Check', label: 'Cheque' },
  { value: 'Other', label: 'Otro' },
]

export function methodLabel(method) {
  return PAYMENT_METHODS.find((m) => m.value === method)?.label || method
}

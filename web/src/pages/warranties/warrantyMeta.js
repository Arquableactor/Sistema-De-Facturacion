// Estado de garantía (derivado al vuelo por el backend). Sirve para cabecera e items.
export const WARRANTY_STATUS = {
  Active: { label: 'Vigente', tone: 'green' },
  Expired: { label: 'Vencida', tone: 'amber' },
  Void: { label: 'Anulada', tone: 'gray' },
}

export function warrantyStatusMeta(status) {
  return WARRANTY_STATUS[status] || { label: status, tone: 'gray' }
}

import { api, getBlob, saveBlob } from './client.js'

// Módulo Facturas sobre el cliente central.
export function getInvoices({ status } = {}) {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return api.get(`/api/invoices${qs}`)
}

export function getInvoice(id) {
  return api.get(`/api/invoices/${id}`)
}

// Crea en Draft. El backend deriva el cliente del proyecto y calcula los precios/totales
// (el front NO envía precios ni totales).
export function createInvoice(data) {
  return api.post('/api/invoices', data)
}

// Draft -> Issued (asigna NCF).
export function issueInvoice(id) {
  return api.post(`/api/invoices/${id}/issue`)
}

// Descarga el PDF (binario) con nombre factura-{invoiceNumber}.pdf.
export async function downloadInvoicePdf(id, invoiceNumber) {
  const blob = await getBlob(`/api/invoices/${id}/pdf`)
  saveBlob(blob, `factura-${invoiceNumber || id}.pdf`)
}

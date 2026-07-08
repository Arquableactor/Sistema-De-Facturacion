// Estimado EN VIVO de la factura mientras el usuario la arma. Espeja la matemática del
// backend (ITBIS 18%, redondeo a 2 decimales), pero el SERVER es la verdad: al guardar
// se muestran los totales reales de la respuesta y estos estimados se descartan.
const ITBIS_RATE = 0.18

export function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100
}

// Estimado de una línea con el precio unitario EDITADO de la línea (sujeto al mercado).
export function estimateLine(unitPrice, quantity, discount) {
  const price = round2(unitPrice)
  const qty = Number(quantity) || 0
  const gross = round2(price * qty)
  const disc = round2(discount)
  const taxable = round2(gross - disc)
  const itbis = round2(taxable * ITBIS_RATE)
  const lineTotal = round2(taxable + itbis)
  return { price, gross, discount: disc, taxable, itbis, lineTotal }
}

// Estimado del total de la factura sobre las líneas (cada una con su unitPrice editado).
export function estimateInvoice(lines) {
  let subtotal = 0
  let itbis = 0
  let discount = 0
  const rows = lines.map((l) => {
    const e = estimateLine(l.unitPrice, l.quantity, l.discount)
    subtotal = round2(subtotal + e.taxable)
    itbis = round2(itbis + e.itbis)
    discount = round2(discount + e.discount)
    return e
  })
  return { rows, subtotal, itbis, discount, total: round2(subtotal + itbis) }
}

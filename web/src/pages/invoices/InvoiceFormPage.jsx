import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Topbar from '../../components/layout/Topbar.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { useToast } from '../../components/ui/Toast.jsx'
import { money, today } from '../../lib/format.js'
import { getProjects } from '../../api/projectsApi.js'
import { getProducts } from '../../api/productsApi.js'
import { createInvoice } from '../../api/invoicesApi.js'
import { estimateInvoice, round2 } from './estimate.js'

const inputCls = (hasError) =>
  `w-full rounded-btn border bg-surface px-3 py-2 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
    hasError
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

export default function InvoiceFormPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Opciones (proyectos + productos activos).
  const [projects, setProjects] = useState([])
  const [products, setProducts] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')

  // Cabecera.
  const [projectId, setProjectId] = useState('')
  const [date, setDate] = useState(today())
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')

  // Líneas (con key estable para add/remove).
  const keyRef = useRef(0)
  const newLine = () => ({
    key: (keyRef.current += 1),
    productId: '',
    description: '',
    unitPrice: '',
    quantity: '1',
    discount: '',
  })
  const [lines, setLines] = useState(() => [newLine()])

  const [errors, setErrors] = useState({ header: {}, lineErrs: {} })
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const loadOptions = useCallback(() => {
    setOptionsLoading(true)
    setOptionsError('')
    return Promise.all([getProjects(), getProducts()])
      .then(([ps, prods]) => {
        setProjects(ps || [])
        setProducts(prods || [])
      })
      .catch((err) => setOptionsError(err.message || 'No se pudieron cargar las opciones.'))
      .finally(() => setOptionsLoading(false))
  }, [])

  useEffect(() => {
    loadOptions()
  }, [loadOptions])

  const productById = useMemo(() => new Map(products.map((p) => [p.id, p])), [products])
  const selectedProject = projects.find((p) => String(p.id) === projectId)
  const est = useMemo(() => estimateInvoice(lines), [lines])

  function updateLine(key, field, value) {
    setLines((ls) => ls.map((l) => (l.key === key ? { ...l, [field]: value } : l)))
  }
  // Al elegir el producto, precarga el precio (catálogo) y la descripción (del catálogo,
  // o el nombre si no tiene). Ambos quedan editables.
  function setProduct(key, productId) {
    const product = productById.get(Number(productId))
    setLines((ls) =>
      ls.map((l) =>
        l.key === key
          ? {
              ...l,
              productId,
              unitPrice: product ? String(product.price) : '',
              description: product ? product.description || product.name : '',
            }
          : l,
      ),
    )
  }
  function addLine() {
    setLines((ls) => [...ls, newLine()])
  }
  function removeLine(key) {
    setLines((ls) => (ls.length > 1 ? ls.filter((l) => l.key !== key) : ls))
  }

  function validate() {
    const header = {}
    const lineErrs = {}
    if (!projectId) header.projectId = 'Selecciona un proyecto.'
    if (!date) header.date = 'La fecha es obligatoria.'
    if (!dueDate) header.dueDate = 'El vencimiento es obligatorio.'
    else if (date && dueDate < date) header.dueDate = 'El vencimiento debe ser ≥ la fecha.'

    lines.forEach((l) => {
      const le = {}
      if (!l.productId) le.product = 'Selecciona un producto.'
      const qty = Number(l.quantity)
      if (l.quantity === '' || Number.isNaN(qty) || qty <= 0) le.quantity = 'La cantidad debe ser > 0.'
      const price = Number(l.unitPrice)
      if (l.unitPrice === '' || Number.isNaN(price) || price < 0) le.unitPrice = 'Precio inválido (≥ 0).'
      const disc = Number(l.discount || 0)
      if (Number.isNaN(disc) || disc < 0) le.discount = 'El descuento debe ser ≥ 0.'
      else if (!Number.isNaN(price) && qty > 0 && disc > round2(price * qty)) {
        le.discount = 'No puede superar precio × cantidad.'
      }
      if (Object.keys(le).length) lineErrs[l.key] = le
    })

    return { header, lineErrs, ok: !Object.keys(header).length && !Object.keys(lineErrs).length }
  }

  async function onSubmit(e) {
    e.preventDefault()
    const v = validate()
    setErrors(v)
    setFormError('')
    if (!v.ok) {
      setFormError('Revisa los campos marcados.')
      return
    }

    setSubmitting(true)
    try {
      // El server calcula ITBIS/totales y deriva el cliente. El precio unitario y la
      // descripción por línea SÍ se envían (editables, sujetos al mercado); no se envían
      // totales. La descripción se omite si quedó vacía (server usa la del catálogo).
      const payload = {
        projectId: Number(projectId),
        items: lines.map((l) => {
          const item = {
            productId: Number(l.productId),
            quantity: Number(l.quantity),
            unitPrice: Number(l.unitPrice),
          }
          const disc = Number(l.discount || 0)
          if (disc > 0) item.discount = disc
          const desc = l.description.trim()
          if (desc) item.description = desc
          return item
        }),
        dueDate,
        notes: notes.trim() || null,
      }
      // `date` es opcional en el contrato: se omite si está vacío (nunca se envía "").
      if (date) payload.date = date
      const created = await createInvoice(payload)
      toast.success(`Factura ${created.invoiceNumber} creada (borrador).`)
      navigate('/facturacion')
    } catch (err) {
      // Los 400 de facturas vienen como { message } (proyecto inactivo, producto inválido, etc.).
      setFormError(err.message || 'No se pudo crear la factura.')
    } finally {
      setSubmitting(false)
    }
  }

  const optionsReady = !optionsLoading && !optionsError

  return (
    <>
      <Topbar
        title="Nueva factura"
        subtitle="Se crea como borrador; se emite (NCF) después"
        action={
          <Link
            to="/facturacion"
            className="inline-flex items-center rounded-btn px-3 py-2 text-sm font-medium text-muted hover:bg-edge-soft"
          >
            ← Facturas
          </Link>
        }
      />

      <div className="p-6">
        {optionsError ? (
          <div className="grid place-items-center rounded-card border border-edge bg-surface py-16 text-center">
            <div>
              <p className="text-sm font-semibold text-danger-strong">{optionsError}</p>
              <Button variant="ghost" className="mt-3" onClick={loadOptions}>
                Reintentar
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            {optionsLoading && (
              <div className="flex items-center gap-2 rounded-btn bg-primary-soft px-3 py-2 text-sm text-primary">
                <Spinner size={14} /> Cargando proyectos y productos…
              </div>
            )}
            {formError && (
              <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
                {formError}
              </div>
            )}

            {/* Cabecera */}
            <div className="rounded-card border border-edge bg-surface p-5 shadow-card">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Field id="projectId" label="Proyecto" error={errors.header.projectId}>
                  <select
                    id="projectId"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    disabled={optionsLoading}
                    className={inputCls(errors.header.projectId)}
                  >
                    <option value="">{optionsLoading ? 'Cargando…' : 'Selecciona…'}</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nombre}
                      </option>
                    ))}
                  </select>
                </Field>

                <div>
                  <div className="mb-1.5 text-sm font-medium text-muted">Cliente (derivado)</div>
                  <div className="rounded-btn border border-edge bg-edge-soft px-3 py-2 text-sm text-muted">
                    {selectedProject ? selectedProject.clientName : '—'}
                  </div>
                </div>

                <Field
                  id="date"
                  label="Fecha"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  error={errors.header.date}
                />
                <Field
                  id="dueDate"
                  label="Vencimiento"
                  type="date"
                  value={dueDate}
                  min={date || undefined}
                  onChange={(e) => setDueDate(e.target.value)}
                  error={errors.header.dueDate}
                />
              </div>
            </div>

            {/* Líneas */}
            <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
              <div className="flex items-center justify-between border-b border-edge px-5 py-3">
                <h2 className="font-display text-sm font-semibold text-brand-text">Líneas</h2>
                <Button type="button" variant="ghost" onClick={addLine}>
                  + Agregar línea
                </Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="min-w-[170px] px-3 py-2.5 font-semibold">Producto</th>
                      <th className="min-w-[190px] px-3 py-2.5 font-semibold">Descripción</th>
                      <th className="w-20 px-3 py-2.5 text-right font-semibold">Cant.</th>
                      <th className="w-28 px-3 py-2.5 text-right font-semibold">Precio unit.</th>
                      <th className="w-24 px-3 py-2.5 text-right font-semibold">Descuento</th>
                      <th className="w-24 px-3 py-2.5 text-right font-semibold">ITBIS *</th>
                      <th className="w-28 px-3 py-2.5 text-right font-semibold">Total *</th>
                      <th className="w-10 px-3 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((l, i) => {
                      const le = errors.lineErrs[l.key] || {}
                      const row = est.rows[i]
                      return (
                        <tr key={l.key} className="border-t border-edge align-top">
                          <td className="px-3 py-2">
                            <select
                              value={l.productId}
                              onChange={(e) => setProduct(l.key, e.target.value)}
                              className={inputCls(le.product)}
                              title={le.product}
                            >
                              <option value="">Selecciona…</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.code}) — {money(p.price)}
                                </option>
                              ))}
                            </select>
                            {le.product && (
                              <div className="mt-1 text-xs text-danger-strong">{le.product}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="text"
                              maxLength={500}
                              value={l.description}
                              onChange={(e) => updateLine(l.key, 'description', e.target.value)}
                              className={inputCls(false)}
                              placeholder="Descripción de la línea"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={l.quantity}
                              onChange={(e) => updateLine(l.key, 'quantity', e.target.value)}
                              className={`${inputCls(le.quantity)} text-right`}
                              title={le.quantity}
                            />
                            {le.quantity && (
                              <div className="mt-1 text-xs text-danger-strong">{le.quantity}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={l.unitPrice}
                              onChange={(e) => updateLine(l.key, 'unitPrice', e.target.value)}
                              className={`${inputCls(le.unitPrice)} text-right`}
                              title={le.unitPrice}
                              placeholder="0.00"
                            />
                            {le.unitPrice && (
                              <div className="mt-1 text-xs text-danger-strong">{le.unitPrice}</div>
                            )}
                          </td>
                          <td className="px-3 py-2">
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={l.discount}
                              placeholder="0"
                              onChange={(e) => updateLine(l.key, 'discount', e.target.value)}
                              className={`${inputCls(le.discount)} text-right`}
                              title={le.discount}
                            />
                            {le.discount && (
                              <div className="mt-1 text-xs text-danger-strong">{le.discount}</div>
                            )}
                          </td>
                          <td className="px-3 py-3 text-right tabular text-muted">{money(row.itbis)}</td>
                          <td className="px-3 py-3 text-right tabular text-brand-text">
                            {money(row.lineTotal)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => removeLine(l.key)}
                              disabled={lines.length === 1}
                              aria-label="Quitar línea"
                              className="rounded-md px-2 py-1 text-muted hover:bg-danger-soft hover:text-danger-strong disabled:cursor-not-allowed disabled:opacity-40"
                              title={lines.length === 1 ? 'Debe haber al menos una línea' : 'Quitar línea'}
                            >
                              ✕
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pie: totales estimados */}
              <div className="flex justify-end border-t border-edge bg-edge-soft/40 px-5 py-4">
                <div className="w-64 space-y-1.5 text-sm">
                  <div className="mb-1 text-right text-xs font-semibold uppercase tracking-wide text-faint">
                    Estimado (el total real lo calcula el servidor)
                  </div>
                  <Row label="Subtotal" value={money(est.subtotal)} />
                  <Row label="ITBIS (18%)" value={money(est.itbis)} />
                  <Row label="Descuento" value={money(est.discount)} />
                  <div className="border-t border-edge pt-1.5">
                    <Row label="Total" value={money(est.total)} bold />
                  </div>
                </div>
              </div>
            </div>

            {/* Notas + acciones */}
            <div className="rounded-card border border-edge bg-surface p-5 shadow-card">
              <Field id="notes" label="Notas (opcional)">
                <textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={inputCls(false)}
                  placeholder="Observaciones de la factura…"
                />
              </Field>
            </div>

            <div className="flex justify-end gap-2">
              <Link
                to="/facturacion"
                className="inline-flex items-center rounded-btn px-4 py-2.5 text-sm font-semibold text-muted hover:bg-edge-soft"
              >
                Cancelar
              </Link>
              <Button type="submit" loading={submitting} disabled={!optionsReady}>
                Crear factura (borrador)
              </Button>
            </div>
          </form>
        )}
      </div>
    </>
  )
}

function Row({ label, value, bold }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? 'font-semibold text-brand-text' : 'text-muted'}>{label}</span>
      <span className={`tabular ${bold ? 'font-semibold text-brand-text' : 'text-muted'}`}>{value}</span>
    </div>
  )
}

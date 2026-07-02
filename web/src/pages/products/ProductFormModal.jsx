import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createProduct, updateProduct } from '../../api/productsApi.js'
import { monthsToYears, yearsToMonths } from '../../lib/format.js'
import { mapDetails as mapErrorDetails } from '../../lib/apiErrors.js'

const CATEGORIAS = [
  { value: 'PanelSolar', label: 'Panel solar' },
  { value: 'Inversor', label: 'Inversor' },
  { value: 'Bateria', label: 'Batería' },
  { value: 'Estructura', label: 'Estructura' },
  { value: 'Medidor', label: 'Medidor' },
  { value: 'Cableado', label: 'Cableado' },
]

const EMPTY = {
  name: '',
  code: '',
  barcode: '',
  description: '',
  categoria: '',
  marca: '',
  modelo: '',
  especificacion: '',
  price: '',
  years: '', // UI en años; se convierte a meses al enviar
  isSerialized: false,
}

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'El nombre es obligatorio.'
  if (!f.code.trim()) e.code = 'El código es obligatorio.'
  const price = Number(f.price)
  if (f.price === '' || Number.isNaN(price) || price < 0) e.price = 'Precio inválido (debe ser ≥ 0).'
  const years = Number(f.years)
  if (f.years === '' || Number.isNaN(years) || years < 0) e.years = 'Garantía inválida (debe ser ≥ 0).'
  return e
}

// Reusa el mapeo genérico y redirige "warrantyMonths" (backend) al campo "years" (UI).
function mapDetails(details) {
  const map = mapErrorDetails(details)
  if (map.warrantyMonths) {
    map.years = map.warrantyMonths
    delete map.warrantyMonths
  }
  return map
}

export default function ProductFormModal({ open, product, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      product
        ? {
            name: product.name ?? '',
            code: product.code ?? '',
            barcode: product.barcode ?? '',
            description: product.description ?? '',
            categoria: product.categoria ?? '',
            marca: product.marca ?? '',
            modelo: product.modelo ?? '',
            especificacion: product.especificacion ?? '',
            price: product.price != null ? String(product.price) : '',
            years: product.warrantyMonths != null ? String(monthsToYears(product.warrantyMonths)) : '',
            isSerialized: !!product.isSerialized,
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, product])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = validate(form)
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        barcode: form.barcode.trim() || null,
        description: form.description.trim() || null,
        price: Number(form.price),
        warrantyMonths: yearsToMonths(form.years), // años -> meses
        isSerialized: form.isSerialized,
        categoria: form.categoria || null,
        marca: form.marca.trim() || null,
        modelo: form.modelo.trim() || null,
        especificacion: form.especificacion.trim() || null,
      }
      const saved = isEdit
        ? await updateProduct(product.id, { ...payload, isActive: product.isActive })
        : await createProduct(payload)
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        setErrors((prev) => ({ ...prev, code: err.message }))
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo guardar el producto.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectCls = (hasError) =>
    `w-full rounded-btn border bg-white px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
      hasError
        ? 'border-danger focus:border-danger focus:ring-danger/15'
        : 'border-edge focus:border-primary focus:ring-primary/15'
    }`

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="lg"
      title={isEdit ? 'Editar producto' : 'Nuevo producto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="product-form" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </>
      }
    >
      <form id="product-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="name"
            label="Nombre"
            value={form.name}
            onChange={(e) => set('name', e.target.value)}
            error={errors.name}
            placeholder="Panel solar 550W"
          />
          <Field
            id="code"
            label="Código"
            value={form.code}
            onChange={(e) => set('code', e.target.value)}
            error={errors.code}
            placeholder="PNL-550"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field id="categoria" label="Categoría (opcional)" error={errors.categoria}>
            <select
              id="categoria"
              value={form.categoria}
              onChange={(e) => set('categoria', e.target.value)}
              className={selectCls(errors.categoria)}
            >
              <option value="">Sin categoría</option>
              {CATEGORIAS.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </Field>
          <Field
            id="barcode"
            label="Código de barras (opcional)"
            value={form.barcode}
            onChange={(e) => set('barcode', e.target.value)}
            error={errors.barcode}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="marca"
            label="Marca (opcional)"
            value={form.marca}
            onChange={(e) => set('marca', e.target.value)}
            error={errors.marca}
            placeholder="Canadian Solar"
          />
          <Field
            id="modelo"
            label="Modelo (opcional)"
            value={form.modelo}
            onChange={(e) => set('modelo', e.target.value)}
            error={errors.modelo}
            placeholder="CS7L-550MS"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field
            id="price"
            label="Precio (RD$)"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            error={errors.price}
            placeholder="0.00"
          />
          <Field
            id="years"
            label="Garantía (años)"
            type="number"
            min="0"
            step="0.5"
            value={form.years}
            onChange={(e) => set('years', e.target.value)}
            error={errors.years}
            placeholder="10"
          />
          <Field
            id="especificacion"
            label="Especificación (opcional)"
            value={form.especificacion}
            onChange={(e) => set('especificacion', e.target.value)}
            error={errors.especificacion}
            placeholder="Monocristalino 550W"
          />
        </div>

        <Field id="description" label="Descripción (opcional)" error={errors.description}>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            className={selectCls(errors.description)}
            placeholder="Detalle del producto…"
          />
        </Field>

        <label className="flex cursor-pointer items-center gap-2.5 pt-1 text-sm text-brand-text">
          <input
            type="checkbox"
            checked={form.isSerialized}
            onChange={(e) => set('isSerialized', e.target.checked)}
            className="h-4 w-4 rounded border-edge text-primary focus:ring-primary/30"
          />
          Producto serializado (cada unidad lleva número de serie)
        </label>
      </form>
    </Modal>
  )
}

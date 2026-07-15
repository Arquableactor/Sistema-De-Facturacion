import { useCallback, useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { getProducts } from '../../api/productsApi.js'
import { createEquipo } from '../../api/equiposApi.js'
import { formatWarranty, today } from '../../lib/format.js'
import { mapDetails } from '../../lib/apiErrors.js'

// Registrar un equipo instalado en un proyecto. Carga sus opciones (productos activos)
// al abrir, igual que ProjectFormModal. El backend deriva clientId/marca/modelo/garantía.
export default function EquipoFormModal({ open, projectId, onClose, onSaved }) {
  const [productId, setProductId] = useState('')
  const [serialNumber, setSerialNumber] = useState('')
  const [fechaInstalacion, setFechaInstalacion] = useState(today())
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const [products, setProducts] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState('')

  const loadOptions = useCallback(() => {
    setOptionsLoading(true)
    setOptionsError('')
    // getProducts() sin includeInactive -> solo productos activos.
    return getProducts()
      .then((ps) => setProducts(ps || []))
      .catch((err) => setOptionsError(err.message || 'No se pudieron cargar los productos.'))
      .finally(() => setOptionsLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    setProductId('')
    setSerialNumber('')
    setFechaInstalacion(today())
    setErrors({})
    setFormError('')
    loadOptions()
  }, [open, loadOptions])

  const selected = products.find((p) => String(p.id) === String(productId))

  function validate() {
    const e = {}
    if (!productId) e.productId = 'Selecciona un producto.'
    if (!serialNumber.trim()) e.serialNumber = 'El número de serie es obligatorio.'
    if (!fechaInstalacion) e.fechaInstalacion = 'La fecha de instalación es obligatoria.'
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
      const saved = await createEquipo(projectId, {
        productId: Number(productId),
        serialNumber: serialNumber.trim(),
        fechaInstalacion,
      })
      onSaved(saved)
    } catch (err) {
      if (err.status === 409) {
        // Serial duplicado: lo resaltamos en el campo + banner.
        setErrors((prev) => ({ ...prev, serialNumber: err.message }))
        setFormError(err.message)
      } else if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else {
        setFormError(err.message || 'No se pudo registrar el equipo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectCls = (hasError) =>
    `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 disabled:bg-edge-soft disabled:text-muted ${
      hasError
        ? 'border-danger focus:border-danger focus:ring-danger/15'
        : 'border-edge focus:border-primary focus:ring-primary/15'
    }`

  const optionsReady = !optionsLoading && !optionsError

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      title="Registrar equipo instalado"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="equipo-form" loading={submitting} disabled={!optionsReady}>
            Registrar
          </Button>
        </>
      }
    >
      {optionsError ? (
        <div className="space-y-3 py-6 text-center">
          <p className="text-sm font-semibold text-danger-strong">{optionsError}</p>
          <Button variant="ghost" onClick={loadOptions}>
            Reintentar
          </Button>
        </div>
      ) : (
        <form id="equipo-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          {optionsLoading && (
            <div className="flex items-center gap-2 rounded-btn bg-primary-soft px-3 py-2 text-sm text-primary">
              <Spinner size={14} /> Cargando productos…
            </div>
          )}
          {formError && (
            <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
              {formError}
            </div>
          )}

          <Field id="productId" label="Producto" error={errors.productId}>
            <select
              id="productId"
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              disabled={optionsLoading}
              className={selectCls(errors.productId)}
            >
              <option value="">{optionsLoading ? 'Cargando…' : 'Selecciona…'}</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </Field>

          {/* Informativo (no se envía): confirma marca/modelo/garantía del producto elegido. */}
          {selected && (
            <div className="rounded-btn bg-edge-soft px-3 py-2 text-xs text-muted">
              {[selected.marca, selected.modelo].filter(Boolean).join(' · ') || 'Sin marca/modelo'}
              {' · Garantía '}
              {formatWarranty(selected.warrantyMonths)}
              {selected.isSerialized ? ' · Serializado' : ''}
            </div>
          )}

          <Field
            id="serialNumber"
            label="Número de serie"
            value={serialNumber}
            onChange={(e) => setSerialNumber(e.target.value)}
            error={errors.serialNumber}
            maxLength={100}
            placeholder="Ej. PNL-2026-000123"
          />

          <Field
            id="fechaInstalacion"
            label="Fecha de instalación"
            type="date"
            value={fechaInstalacion}
            onChange={(e) => setFechaInstalacion(e.target.value)}
            error={errors.fechaInstalacion}
          />
        </form>
      )}
    </Modal>
  )
}

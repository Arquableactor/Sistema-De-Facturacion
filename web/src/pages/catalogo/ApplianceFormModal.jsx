import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createAppliance, updateAppliance } from '../../api/appliancesApi.js'
import { mapDetails } from '../../lib/apiErrors.js'

// Las 6 categorías del seed. Es un string libre en la DB, pero ofrecerlas como select
// mantiene el catálogo consistente (y coincide con los colores del formulario público).
const CATEGORIAS = ['Climatización', 'Cocina', 'Agua', 'Entretenimiento', 'Lavado', 'Iluminación']

const EMPTY = { nombre: '', categoria: '', wattsTipicos: '', horasPorDiaSugeridas: '', isActive: 'true' }

const selectCls = (error) =>
  `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

function validate(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
  const w = Number(f.wattsTipicos)
  if (f.wattsTipicos === '' || !Number.isInteger(w) || w < 1) e.wattsTipicos = 'Watts debe ser un entero mayor que 0.'
  const h = Number(f.horasPorDiaSugeridas)
  if (f.horasPorDiaSugeridas === '' || Number.isNaN(h) || h < 0.5 || h > 24)
    e.horasPorDiaSugeridas = 'Horas entre 0.5 y 24.'
  return e
}

export default function ApplianceFormModal({ open, appliance, onClose, onSaved }) {
  const isEdit = !!appliance
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      appliance
        ? {
            nombre: appliance.nombre ?? '',
            categoria: appliance.categoria ?? '',
            wattsTipicos: appliance.wattsTipicos != null ? String(appliance.wattsTipicos) : '',
            horasPorDiaSugeridas:
              appliance.horasPorDiaSugeridas != null ? String(appliance.horasPorDiaSugeridas) : '',
            isActive: appliance.isActive ? 'true' : 'false',
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, appliance])

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
        nombre: form.nombre.trim(),
        categoria: form.categoria || null,
        wattsTipicos: Number(form.wattsTipicos),
        horasPorDiaSugeridas: Number(form.horasPorDiaSugeridas),
      }
      const saved = isEdit
        ? await updateAppliance(appliance.id, { ...payload, isActive: form.isActive === 'true' })
        : await createAppliance(payload)
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        setErrors((prev) => ({ ...prev, nombre: err.message }))
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo guardar el electrodoméstico.')
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
      title={isEdit ? 'Editar electrodoméstico' : 'Nuevo electrodoméstico'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="appliance-form" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear'}
          </Button>
        </>
      }
    >
      <form id="appliance-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <Field
          id="ap-nombre"
          label="Nombre"
          value={form.nombre}
          onChange={(e) => set('nombre', e.target.value)}
          error={errors.nombre}
          placeholder="Ej. Aire acondicionado 12k BTU"
        />

        <Field id="ap-categoria" label="Categoría (opcional)" error={errors.categoria}>
          <select
            id="ap-categoria"
            value={form.categoria}
            onChange={(e) => set('categoria', e.target.value)}
            className={selectCls(errors.categoria)}
          >
            <option value="">Sin categoría</option>
            {CATEGORIAS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
            {/* Conserva una categoría fuera de la lista (si la trajo un registro viejo). */}
            {form.categoria && !CATEGORIAS.includes(form.categoria) && (
              <option value={form.categoria}>{form.categoria}</option>
            )}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="ap-watts"
            label="Watts típicos"
            type="number"
            min="1"
            step="1"
            value={form.wattsTipicos}
            onChange={(e) => set('wattsTipicos', e.target.value)}
            error={errors.wattsTipicos}
            placeholder="1100"
          />
          <Field
            id="ap-horas"
            label="Horas/día sugeridas"
            type="number"
            min="0.5"
            max="24"
            step="0.5"
            value={form.horasPorDiaSugeridas}
            onChange={(e) => set('horasPorDiaSugeridas', e.target.value)}
            error={errors.horasPorDiaSugeridas}
            placeholder="8"
          />
        </div>

        {isEdit && (
          <Field id="ap-estado" label="Estado">
            <select
              id="ap-estado"
              value={form.isActive}
              onChange={(e) => set('isActive', e.target.value)}
              className={selectCls(false)}
            >
              <option value="true">Activo</option>
              <option value="false">Inactivo</option>
            </select>
          </Field>
        )}
      </form>
    </Modal>
  )
}

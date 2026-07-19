import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createNcfSequence, updateNcfSequence } from '../../api/ncfSequencesApi.js'
import { mapDetails } from '../../lib/apiErrors.js'
import { today } from '../../lib/format.js'

const EMPTY = {
  type: 'B01',
  numeroAutorizacion: '',
  startNumber: '',
  maxNumber: '',
  fechaVencimiento: '',
  isActive: 'true',
}

const selectCls = (error) =>
  `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

// ISO del backend -> 'YYYY-MM-DD' para el input date (o '' si no hay).
function toDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${mm}-${dd}`
}

function validate(f, isEdit) {
  const e = {}
  if (!isEdit) {
    if (!f.type.trim()) e.type = 'El tipo es obligatorio.'
    const start = Number(f.startNumber)
    if (f.startNumber === '' || !Number.isInteger(start) || start < 1)
      e.startNumber = 'El número inicial debe ser un entero mayor que 0.'
    const max = Number(f.maxNumber)
    if (f.maxNumber === '' || !Number.isInteger(max) || max < 1)
      e.maxNumber = 'El número final debe ser un entero mayor que 0.'
    else if (Number.isInteger(start) && max < start)
      e.maxNumber = 'El número final no puede ser menor que el inicial.'
    if (!f.fechaVencimiento) e.fechaVencimiento = 'La fecha de vencimiento es obligatoria.'
    else if (f.fechaVencimiento <= today()) e.fechaVencimiento = 'La fecha debe ser futura.'
  } else {
    // En edición solo se tocan datos administrativos; los números no.
    if (!f.fechaVencimiento) e.fechaVencimiento = 'La fecha de vencimiento es obligatoria.'
  }
  if (!f.numeroAutorizacion.trim()) e.numeroAutorizacion = 'El número de autorización es obligatorio.'
  return e
}

// Alta/edición de una secuencia NCF. En ALTA se piden los datos de la autorización de la
// DGII (rango + vencimiento). En EDICIÓN los números van en SOLO-LECTURA: cambiarlos podría
// re-emitir un comprobante ya usado.
export default function NcfSequenceFormModal({ open, sequence, onClose, onSaved }) {
  const isEdit = !!sequence
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      sequence
        ? {
            type: sequence.type ?? '',
            numeroAutorizacion: sequence.numeroAutorizacion ?? '',
            startNumber: sequence.startNumber != null ? String(sequence.startNumber) : '',
            maxNumber: sequence.maxNumber != null ? String(sequence.maxNumber) : '',
            fechaVencimiento: toDateInput(sequence.fechaVencimiento),
            isActive: sequence.isActive ? 'true' : 'false',
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, sequence])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    const errs = validate(form, isEdit)
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      const saved = isEdit
        ? await updateNcfSequence(sequence.id, {
            numeroAutorizacion: form.numeroAutorizacion.trim(),
            fechaVencimiento: form.fechaVencimiento,
            isActive: form.isActive === 'true',
          })
        : await createNcfSequence({
            type: form.type.trim(),
            numeroAutorizacion: form.numeroAutorizacion.trim(),
            startNumber: Number(form.startNumber),
            maxNumber: Number(form.maxNumber),
            fechaVencimiento: form.fechaVencimiento,
          })
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        setFormError(err.message || 'El rango se solapa con otra secuencia activa.')
      } else {
        setFormError(err.message || 'No se pudo guardar la secuencia.')
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
      title={isEdit ? 'Editar secuencia NCF' : 'Nueva secuencia NCF'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="ncf-form" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear'}
          </Button>
        </>
      }
    >
      <form id="ncf-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <p className="rounded-btn bg-primary-soft px-3 py-2.5 text-xs text-brand-text">
          Estos datos vienen de la <strong>autorización de la DGII</strong>: el tipo de
          comprobante, el número de autorización, el rango (desde–hasta) y la fecha de
          vencimiento.
        </p>

        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        {isEdit ? (
          // Números en solo-lectura: no son editables.
          <div className="rounded-btn border border-edge bg-edge-soft/50 px-3.5 py-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
              <span className="text-muted">Tipo</span>
              <span className="text-right font-medium text-brand-text">{form.type}</span>
              <span className="text-muted">Rango autorizado</span>
              <span className="text-right tabular font-medium text-brand-text">
                {Number(form.startNumber).toLocaleString('es-DO')} –{' '}
                {Number(form.maxNumber).toLocaleString('es-DO')}
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              El rango no se puede cambiar: evita re-emitir un comprobante ya usado.
            </p>
          </div>
        ) : (
          <>
            <Field
              id="ncf-type"
              label="Tipo de comprobante"
              value={form.type}
              onChange={(e) => set('type', e.target.value)}
              error={errors.type}
              placeholder="Ej. B01"
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                id="ncf-start"
                label="Desde (número inicial)"
                type="number"
                min="1"
                step="1"
                value={form.startNumber}
                onChange={(e) => set('startNumber', e.target.value)}
                error={errors.startNumber}
                placeholder="1"
              />
              <Field
                id="ncf-max"
                label="Hasta (número final)"
                type="number"
                min="1"
                step="1"
                value={form.maxNumber}
                onChange={(e) => set('maxNumber', e.target.value)}
                error={errors.maxNumber}
                placeholder="100000"
              />
            </div>
          </>
        )}

        <Field
          id="ncf-auth"
          label="Número de autorización (DGII)"
          value={form.numeroAutorizacion}
          onChange={(e) => set('numeroAutorizacion', e.target.value)}
          error={errors.numeroAutorizacion}
          placeholder="Ej. A0100000001"
        />

        <Field
          id="ncf-venc"
          label="Fecha de vencimiento"
          type="date"
          min={today()}
          value={form.fechaVencimiento}
          onChange={(e) => set('fechaVencimiento', e.target.value)}
          error={errors.fechaVencimiento}
        />

        {isEdit && (
          <Field id="ncf-estado" label="Estado">
            <select
              id="ncf-estado"
              value={form.isActive}
              onChange={(e) => set('isActive', e.target.value)}
              className={selectCls(false)}
            >
              <option value="true">Activa</option>
              <option value="false">Inactiva</option>
            </select>
          </Field>
        )}
      </form>
    </Modal>
  )
}

import { useCallback, useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { createProject, updateProject } from '../../api/projectsApi.js'
import { getClients } from '../../api/clientsApi.js'
import { getUsers } from '../../api/usersApi.js'
import { mapDetails } from '../../lib/apiErrors.js'

export const ETAPAS = [
  { value: 'Visita', label: 'Visita' },
  { value: 'Diseno', label: 'Diseño' },
  { value: 'Permisos', label: 'Permisos' },
  { value: 'Montaje', label: 'Montaje' },
  { value: 'Conexion', label: 'Conexión' },
  { value: 'Finalizado', label: 'Finalizado' },
]

const EMPTY = {
  nombre: '',
  clientId: '',
  responsableId: '',
  capacidadKwp: '',
  etapa: 'Visita',
  progreso: '0',
  fechaInicio: '',
  fechaClave: '',
  costo: '',
  presupuesto: '',
  notes: '',
}

// ISO -> 'YYYY-MM-DD' para <input type="date">.
function toDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

function num(v) {
  return v === '' || v === null ? NaN : Number(v)
}

function validate(f) {
  const e = {}
  if (!f.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
  if (!f.clientId) e.clientId = 'Selecciona un cliente.'
  if (!f.responsableId) e.responsableId = 'Selecciona un responsable.'
  if (Number.isNaN(num(f.capacidadKwp)) || num(f.capacidadKwp) < 0) e.capacidadKwp = 'Capacidad inválida (≥ 0).'
  const p = num(f.progreso)
  if (Number.isNaN(p) || p < 0 || p > 100) e.progreso = 'Progreso 0–100.'
  if (!f.fechaInicio) e.fechaInicio = 'La fecha de inicio es obligatoria.'
  if (Number.isNaN(num(f.costo)) || num(f.costo) < 0) e.costo = 'Costo inválido (≥ 0).'
  if (Number.isNaN(num(f.presupuesto)) || num(f.presupuesto) < 0) e.presupuesto = 'Presupuesto inválido (≥ 0).'
  return e
}

// Modal de crear/editar proyecto. NOVEDAD: carga sus propias opciones (clientes y
// usuarios) al abrirse. Plantilla del patrón "form relacional" que Facturas reusará.
export default function ProjectFormModal({ open, project, onClose, onSaved }) {
  const isEdit = !!project
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Opciones de los selects relacionales.
  const [clients, setClients] = useState([])
  const [users, setUsers] = useState([])
  const [optionsLoading, setOptionsLoading] = useState(false)
  const [optionsError, setOptionsError] = useState('')

  const loadOptions = useCallback(() => {
    setOptionsLoading(true)
    setOptionsError('')
    return Promise.all([getClients(), getUsers()])
      .then(([cs, us]) => {
        setClients(cs || [])
        setUsers(us || [])
      })
      .catch((err) => setOptionsError(err.message || 'No se pudieron cargar las opciones.'))
      .finally(() => setOptionsLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    loadOptions()
  }, [open, loadOptions])

  useEffect(() => {
    if (!open) return
    setForm(
      project
        ? {
            nombre: project.nombre ?? '',
            clientId: project.clientId != null ? String(project.clientId) : '',
            responsableId: project.responsableId != null ? String(project.responsableId) : '',
            capacidadKwp: project.capacidadKwp != null ? String(project.capacidadKwp) : '',
            etapa: project.etapa ?? 'Visita',
            progreso: project.progreso != null ? String(project.progreso) : '0',
            fechaInicio: toDateInput(project.fechaInicio),
            fechaClave: toDateInput(project.fechaClave),
            costo: project.costo != null ? String(project.costo) : '',
            presupuesto: project.presupuesto != null ? String(project.presupuesto) : '',
            notes: project.notes ?? '',
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, project])

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
      const base = {
        nombre: form.nombre.trim(),
        responsableId: Number(form.responsableId),
        capacidadKwp: Number(form.capacidadKwp || 0),
        etapa: form.etapa,
        progreso: Number(form.progreso || 0),
        fechaInicio: form.fechaInicio,
        fechaClave: form.fechaClave || null,
        costo: Number(form.costo || 0),
        presupuesto: Number(form.presupuesto || 0),
        notes: form.notes.trim() || null,
      }
      // En crear se manda clientId; en editar el backend NO lo acepta (cliente fijo).
      const saved = isEdit
        ? await updateProject(project.id, { ...base, isActive: project.isActive })
        : await createProject({ ...base, clientId: Number(form.clientId) })
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo guardar el proyecto.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const selectCls = (hasError) =>
    `w-full rounded-btn border bg-white px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 disabled:bg-edge-soft disabled:text-muted ${
      hasError
        ? 'border-danger focus:border-danger focus:ring-danger/15'
        : 'border-edge focus:border-primary focus:ring-primary/15'
    }`

  const optionsReady = !optionsLoading && !optionsError
  const placeholder = optionsLoading ? 'Cargando…' : 'Selecciona…'

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="lg"
      title={isEdit ? 'Editar proyecto' : 'Nuevo proyecto'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="project-form" loading={submitting} disabled={!optionsReady}>
            {isEdit ? 'Guardar cambios' : 'Crear proyecto'}
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
        <form id="project-form" onSubmit={onSubmit} className="space-y-4" noValidate>
          {optionsLoading && (
            <div className="flex items-center gap-2 rounded-btn bg-primary-soft px-3 py-2 text-sm text-primary">
              <Spinner size={14} /> Cargando clientes y responsables…
            </div>
          )}
          {formError && (
            <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
              {formError}
            </div>
          )}

          <Field
            id="nombre"
            label="Nombre del proyecto"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            error={errors.nombre}
            placeholder="Instalación residencial…"
          />

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="clientId"
              label={`Cliente${isEdit ? ' (fijo)' : ''}`}
              error={errors.clientId}
            >
              <select
                id="clientId"
                value={form.clientId}
                onChange={(e) => set('clientId', e.target.value)}
                disabled={isEdit || optionsLoading}
                className={selectCls(errors.clientId)}
              >
                <option value="">{placeholder}</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field id="responsableId" label="Responsable" error={errors.responsableId}>
              <select
                id="responsableId"
                value={form.responsableId}
                onChange={(e) => set('responsableId', e.target.value)}
                disabled={optionsLoading}
                className={selectCls(errors.responsableId)}
              >
                <option value="">{placeholder}</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.fullName} · {u.role}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              id="capacidadKwp"
              label="Capacidad (kWp)"
              type="number"
              min="0"
              step="0.01"
              value={form.capacidadKwp}
              onChange={(e) => set('capacidadKwp', e.target.value)}
              error={errors.capacidadKwp}
              placeholder="5.5"
            />
            <Field id="etapa" label="Etapa" error={errors.etapa}>
              <select
                id="etapa"
                value={form.etapa}
                onChange={(e) => set('etapa', e.target.value)}
                className={selectCls(errors.etapa)}
              >
                {ETAPAS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field
              id="progreso"
              label="Progreso (%)"
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.progreso}
              onChange={(e) => set('progreso', e.target.value)}
              error={errors.progreso}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="fechaInicio"
              label="Fecha de inicio"
              type="date"
              value={form.fechaInicio}
              onChange={(e) => set('fechaInicio', e.target.value)}
              error={errors.fechaInicio}
            />
            <Field
              id="fechaClave"
              label="Fecha clave (opcional)"
              type="date"
              value={form.fechaClave}
              onChange={(e) => set('fechaClave', e.target.value)}
              error={errors.fechaClave}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              id="costo"
              label="Costo (RD$)"
              type="number"
              min="0"
              step="0.01"
              value={form.costo}
              onChange={(e) => set('costo', e.target.value)}
              error={errors.costo}
              placeholder="0.00"
            />
            <Field
              id="presupuesto"
              label="Presupuesto (RD$)"
              type="number"
              min="0"
              step="0.01"
              value={form.presupuesto}
              onChange={(e) => set('presupuesto', e.target.value)}
              error={errors.presupuesto}
              placeholder="0.00"
            />
          </div>

          <Field id="notes" label="Notas (opcional)" error={errors.notes}>
            <textarea
              id="notes"
              rows={2}
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
              className={selectCls(errors.notes)}
              placeholder="Observaciones del proyecto…"
            />
          </Field>
        </form>
      )}
    </Modal>
  )
}

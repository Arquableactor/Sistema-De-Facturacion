import { useCallback, useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import Spinner from '../../components/ui/Spinner.jsx'
import { createProject, updateProject, getProject } from '../../api/projectsApi.js'
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

// ISO -> 'YYYY-MM-DD' para <input type="date">. Las fechas se guardan a medianoche
// UTC, así que slice sobre toISOString las devuelve intactas (sin corrimiento).
function toDateInput(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

// Proyecto (respuesta de detalle) -> estado del formulario.
function fromProject(p) {
  return {
    nombre: p.nombre ?? '',
    clientId: p.clientId != null ? String(p.clientId) : '',
    responsableId: p.responsableId != null ? String(p.responsableId) : '',
    capacidadKwp: p.capacidadKwp != null ? String(p.capacidadKwp) : '',
    etapa: p.etapa ?? 'Visita',
    progreso: p.progreso != null ? String(p.progreso) : '0',
    fechaInicio: toDateInput(p.fechaInicio),
    fechaClave: toDateInput(p.fechaClave),
    costo: p.costo != null ? String(p.costo) : '',
    presupuesto: p.presupuesto != null ? String(p.presupuesto) : '',
    notes: p.notes ?? '',
  }
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
  // La fecha clave (fin) nunca puede ser anterior al inicio. Compara 'YYYY-MM-DD' como
  // texto: ese formato ordena igual que la fecha, sin líos de zona horaria.
  if (f.fechaInicio && f.fechaClave && f.fechaClave < f.fechaInicio) {
    e.fechaClave = 'La fecha clave no puede ser anterior a la fecha de inicio.'
  }
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

  // Carga TODO lo que el form necesita: opciones + (si edita) el proyecto FRESCO.
  // El objeto que llega por props puede venir de la LISTA (ProjectListItem), que NO
  // trae fechaInicio/fechaClave/costo/presupuesto/notes: precargar desde ahí dejaba
  // esos campos vacíos y al guardar borraba fechaClave y notes. Por eso pedimos
  // siempre GET /api/projects/{id} al editar.
  const projectId = project?.id ?? null
  const loadOptions = useCallback(() => {
    setOptionsLoading(true)
    setOptionsError('')
    // Limpiamos mientras carga: si no, al reabrir para OTRO proyecto se verían por un
    // instante los valores del anterior. El submit está deshabilitado hasta que llegue.
    setForm(EMPTY)
    return Promise.all([
      getClients(),
      getUsers(),
      projectId != null ? getProject(projectId) : Promise.resolve(null),
    ])
      .then(([cs, us, detail]) => {
        setClients(cs || [])
        setUsers(us || [])
        setForm(detail ? fromProject(detail) : EMPTY)
        setErrors({})
        setFormError('')
      })
      .catch((err) => setOptionsError(err.message || 'No se pudieron cargar los datos.'))
      .finally(() => setOptionsLoading(false))
  }, [projectId])

  useEffect(() => {
    if (!open) return
    loadOptions()
  }, [open, loadOptions])

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
    `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 disabled:bg-edge-soft disabled:text-muted ${
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
              <Spinner size={14} /> {isEdit ? 'Cargando el proyecto…' : 'Cargando clientes y responsables…'}
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
            {/* min = fechaInicio: el propio date-picker ya impide elegir una fecha
                anterior. La validación V1 cubre el caso de escribirla a mano. */}
            <Field
              id="fechaClave"
              label="Fecha clave (opcional)"
              type="date"
              min={form.fechaInicio || undefined}
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

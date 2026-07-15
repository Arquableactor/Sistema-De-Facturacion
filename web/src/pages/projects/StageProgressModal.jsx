import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { updateStageProgress } from '../../api/projectsApi.js'
import { ETAPAS } from './ProjectFormModal.jsx'

// Acción rápida: cambiar Etapa + Progreso sin abrir el form completo (PATCH).
export default function StageProgressModal({ open, project, onClose, onSaved }) {
  const [etapa, setEtapa] = useState('Visita')
  const [progreso, setProgreso] = useState('0')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !project) return
    setEtapa(project.etapa ?? 'Visita')
    setProgreso(project.progreso != null ? String(project.progreso) : '0')
    setError('')
    setFormError('')
  }, [open, project])

  async function onSubmit(e) {
    e.preventDefault()
    const p = Number(progreso)
    if (progreso === '' || Number.isNaN(p) || p < 0 || p > 100) {
      setError('Progreso 0–100.')
      return
    }
    setError('')
    setFormError('')
    setSubmitting(true)
    try {
      const saved = await updateStageProgress(project.id, { etapa, progreso: p })
      onSaved(saved)
    } catch (err) {
      setFormError(err.message || 'No se pudo actualizar.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectCls =
    'w-full rounded-btn border border-edge bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15'

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="sm"
      title="Actualizar etapa y progreso"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="stage-form" loading={submitting}>
            Guardar
          </Button>
        </>
      }
    >
      <form id="stage-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}
        <p className="text-sm text-muted">{project?.nombre}</p>
        <Field id="stage-etapa" label="Etapa">
          <select
            id="stage-etapa"
            value={etapa}
            onChange={(e) => setEtapa(e.target.value)}
            className={selectCls}
          >
            {ETAPAS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field
          id="stage-progreso"
          label="Progreso (%)"
          type="number"
          min="0"
          max="100"
          step="1"
          value={progreso}
          onChange={(e) => setProgreso(e.target.value)}
          error={error}
        />
      </form>
    </Modal>
  )
}

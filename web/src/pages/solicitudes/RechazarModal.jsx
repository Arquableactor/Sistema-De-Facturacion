import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { rechazarSolicitud } from '../../api/solicitudesApi.js'

// Rechazar una solicitud: el motivo es obligatorio y queda como registro de por qué no
// se convirtió en cliente.
export default function RechazarModal({ open, solicitud, onClose, onRechazada }) {
  const [motivo, setMotivo] = useState('')
  const [error, setError] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setMotivo('')
    setError('')
    setFormError('')
  }, [open])

  async function onSubmit(ev) {
    ev.preventDefault()
    if (!motivo.trim()) {
      setError('El motivo es obligatorio.')
      return
    }
    setSubmitting(true)
    setFormError('')
    try {
      const result = await rechazarSolicitud(solicitud.id, motivo.trim())
      onRechazada(result)
    } catch (err) {
      setFormError(err.message || 'No se pudo rechazar la solicitud.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!solicitud) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="sm"
      title="Rechazar solicitud"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button variant="danger" type="submit" form="rechazar-form" loading={submitting}>
            Rechazar
          </Button>
        </>
      }
    >
      <form id="rechazar-form" onSubmit={onSubmit} className="space-y-3" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}
        <p className="text-sm text-muted">
          Rechazar la solicitud de <span className="font-medium text-brand-text">{solicitud.nombre}</span>.
          No se creará ningún cliente.
        </p>
        <Field id="motivo" label="Motivo del rechazo" error={error}>
          <textarea
            id="motivo"
            rows={3}
            value={motivo}
            onChange={(e) => setMotivo(e.target.value)}
            maxLength={500}
            placeholder="Ej. Cédula ya registrada, datos incompletos, fuera de zona de cobertura…"
            className={`w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:ring-2 ${
              error
                ? 'border-danger focus:border-danger focus:ring-danger/15'
                : 'border-edge focus:border-primary focus:ring-primary/15'
            }`}
          />
        </Field>
      </form>
    </Modal>
  )
}

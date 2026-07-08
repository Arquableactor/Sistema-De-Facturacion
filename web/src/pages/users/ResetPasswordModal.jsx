import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { resetUserPassword } from '../../api/usersApi.js'

// Restablecer la contraseña de un usuario (acción sensible, separada de la edición).
// Pide la nueva contraseña dos veces para evitar errores de tipeo.
export default function ResetPasswordModal({ open, user, onClose, onDone }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setPassword('')
    setConfirm('')
    setErrors({})
    setFormError('')
  }, [open])

  async function onSubmit(e) {
    e.preventDefault()
    const errs = {}
    if (password.length < 8) errs.password = 'La contraseña debe tener al menos 8 caracteres.'
    if (confirm !== password) errs.confirm = 'Las contraseñas no coinciden.'
    setErrors(errs)
    setFormError('')
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      await resetUserPassword(user.id, password)
      onDone()
    } catch (err) {
      setFormError(err.message || 'No se pudo restablecer la contraseña.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      size="sm"
      title="Restablecer contraseña"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="reset-password-form" loading={submitting}>
            Restablecer
          </Button>
        </>
      }
    >
      <form id="reset-password-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <p className="text-sm text-muted">
          Nueva contraseña para <span className="font-medium text-brand-text">{user?.fullName}</span>.
        </p>

        <Field
          id="new-password"
          label="Nueva contraseña"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
          placeholder="Mínimo 8 caracteres"
        />

        <Field
          id="confirm-password"
          label="Confirmar contraseña"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          error={errors.confirm}
          placeholder="Repite la contraseña"
        />
      </form>
    </Modal>
  )
}

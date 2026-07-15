import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createUser, updateUser } from '../../api/usersApi.js'
import { ROLE_OPTIONS } from '../../auth/permissions.js'
import { mapDetails } from '../../lib/apiErrors.js'

const EMPTY = { fullName: '', email: '', password: '', role: '', isActive: 'true' }

const selectClass = (error) =>
  `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

function validate(f, isEdit) {
  const e = {}
  if (!f.fullName.trim()) e.fullName = 'El nombre es obligatorio.'
  if (!f.email.trim()) e.email = 'El correo es obligatorio.'
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Correo electrónico inválido.'
  if (!f.role) e.role = 'Selecciona un rol.'
  if (!isEdit && f.password.length < 8) e.password = 'La contraseña debe tener al menos 8 caracteres.'
  return e
}

// Modal de crear/editar usuario. En creación pide contraseña; en edición NO (para eso
// existe "Restablecer contraseña" aparte). Solo la usa la página de Usuarios (Admin).
export default function UserFormModal({ open, user, onClose, onSaved }) {
  const isEdit = !!user
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      user
        ? {
            fullName: user.fullName ?? '',
            email: user.email ?? '',
            password: '',
            role: user.role ?? '',
            isActive: user.isActive ? 'true' : 'false',
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, user])

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
      let saved
      if (isEdit) {
        saved = await updateUser(user.id, {
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          role: form.role,
          isActive: form.isActive === 'true',
        })
      } else {
        saved = await createUser({
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          password: form.password,
          role: form.role,
        })
      }
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        // Correo duplicado o una protección del server (último admin / auto-cambio).
        if (/correo/i.test(err.message || '')) {
          setErrors((prev) => ({ ...prev, email: err.message }))
        }
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo guardar el usuario.')
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
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="user-form" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <form id="user-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <Field
          id="fullName"
          label="Nombre completo"
          value={form.fullName}
          onChange={(e) => set('fullName', e.target.value)}
          error={errors.fullName}
          placeholder="Nombre y apellido"
        />

        <Field
          id="email"
          label="Correo"
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          error={errors.email}
          placeholder="usuario@arqua.local"
        />

        {!isEdit && (
          <Field
            id="password"
            label="Contraseña"
            type="password"
            value={form.password}
            onChange={(e) => set('password', e.target.value)}
            error={errors.password}
            placeholder="Mínimo 8 caracteres"
          />
        )}

        <div className={isEdit ? 'grid grid-cols-2 gap-3' : ''}>
          <Field id="role" label="Rol" error={errors.role}>
            <select
              id="role"
              value={form.role}
              onChange={(e) => set('role', e.target.value)}
              className={selectClass(errors.role)}
            >
              <option value="">Selecciona…</option>
              {ROLE_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </Field>

          {isEdit && (
            <Field id="isActive" label="Estado">
              <select
                id="isActive"
                value={form.isActive}
                onChange={(e) => set('isActive', e.target.value)}
                className={selectClass(false)}
              >
                <option value="true">Activo</option>
                <option value="false">Inactivo</option>
              </select>
            </Field>
          )}
        </div>
      </form>
    </Modal>
  )
}

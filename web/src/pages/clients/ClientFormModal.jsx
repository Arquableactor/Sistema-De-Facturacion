import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createClient, updateClient } from '../../api/clientsApi.js'
import { mapDetails } from '../../lib/apiErrors.js'

const DOC_TYPES = [
  { value: 'Cedula', label: 'Cédula' },
  { value: 'Rnc', label: 'RNC' },
  { value: 'Passport', label: 'Pasaporte' },
]

const EMPTY = {
  name: '',
  documentType: '',
  documentNumber: '',
  phone: '',
  email: '',
  installationAddress: '',
}

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'El nombre es obligatorio.'
  if (!f.documentType) e.documentType = 'Selecciona el tipo de documento.'
  if (!f.documentNumber.trim()) e.documentNumber = 'El documento es obligatorio.'
  if (!f.phone.trim()) e.phone = 'El teléfono es obligatorio.'
  if (!f.installationAddress.trim()) e.installationAddress = 'La dirección es obligatoria.'
  if (f.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim()))
    e.email = 'Correo electrónico inválido.'
  return e
}

// Modal de crear/editar cliente. Plantilla del patrón "form en modal" para otros módulos.
export default function ClientFormModal({ open, client, onClose, onSaved }) {
  const isEdit = !!client
  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setForm(
      client
        ? {
            name: client.name ?? '',
            documentType: client.documentType ?? '',
            documentNumber: client.documentNumber ?? '',
            phone: client.phone ?? '',
            email: client.email ?? '',
            installationAddress: client.installationAddress ?? '',
          }
        : EMPTY,
    )
    setErrors({})
    setFormError('')
  }, [open, client])

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
        documentType: form.documentType,
        documentNumber: form.documentNumber.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        installationAddress: form.installationAddress.trim(),
      }
      const saved = isEdit
        ? await updateClient(client.id, { ...payload, isActive: client.isActive })
        : await createClient(payload)
      onSaved(saved, isEdit)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        // Documento duplicado: lo resaltamos en el campo y como banner.
        setErrors((prev) => ({ ...prev, documentNumber: err.message }))
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo guardar el cliente.')
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
      title={isEdit ? 'Editar cliente' : 'Nuevo cliente'}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" form="client-form" loading={submitting}>
            {isEdit ? 'Guardar cambios' : 'Crear cliente'}
          </Button>
        </>
      }
    >
      <form id="client-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        <Field
          id="name"
          label="Nombre"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          placeholder="Nombre o razón social"
        />

        <div className="grid grid-cols-2 gap-3">
          <Field id="documentType" label="Tipo de documento" error={errors.documentType}>
            <select
              id="documentType"
              value={form.documentType}
              onChange={(e) => set('documentType', e.target.value)}
              className={`w-full rounded-btn border bg-white px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
                errors.documentType
                  ? 'border-danger focus:border-danger focus:ring-danger/15'
                  : 'border-edge focus:border-primary focus:ring-primary/15'
              }`}
            >
              <option value="">Selecciona…</option>
              {DOC_TYPES.map((d) => (
                <option key={d.value} value={d.value}>
                  {d.label}
                </option>
              ))}
            </select>
          </Field>

          <Field
            id="documentNumber"
            label="Número de documento"
            value={form.documentNumber}
            onChange={(e) => set('documentNumber', e.target.value)}
            error={errors.documentNumber}
            placeholder="000-0000000-0"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field
            id="phone"
            label="Teléfono"
            value={form.phone}
            onChange={(e) => set('phone', e.target.value)}
            error={errors.phone}
            placeholder="809-000-0000"
          />
          <Field
            id="email"
            label="Email (opcional)"
            type="email"
            value={form.email}
            onChange={(e) => set('email', e.target.value)}
            error={errors.email}
            placeholder="correo@ejemplo.com"
          />
        </div>

        <Field
          id="installationAddress"
          label="Dirección de instalación"
          value={form.installationAddress}
          onChange={(e) => set('installationAddress', e.target.value)}
          error={errors.installationAddress}
          placeholder="Calle, número, sector, ciudad"
        />
      </form>
    </Modal>
  )
}

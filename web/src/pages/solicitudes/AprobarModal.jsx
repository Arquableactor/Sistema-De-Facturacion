import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { aprobarSolicitud } from '../../api/solicitudesApi.js'
import { mapDetails } from '../../lib/apiErrors.js'
import { cleanPhone, clampPhone, validatePhone, validateEmail } from '../../lib/documentRules.js'
import { docLabel } from './solicitudMeta.js'

const inputCls = (error) =>
  `w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:ring-2 ${
    error
      ? 'border-danger focus:border-danger focus:ring-danger/15'
      : 'border-edge focus:border-primary focus:ring-primary/15'
  }`

// Modal de APROBAR: el revisor corrige los datos del prospecto (que tecleó en el móvil)
// antes de crear el Cliente. El DOCUMENTO va en solo-lectura resaltado: es el ancla de
// identidad y la base del bloqueo por duplicado, no se edita (el backend lo ignora aunque
// llegue). Un 409 de cédula duplicada se muestra con el nombre del cliente existente.
export default function AprobarModal({ open, solicitud, onClose, onAprobada, onRechazarEnVez }) {
  const [form, setForm] = useState({ nombre: '', phone: '', email: '', provincia: '', ubicacion: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [duplicado, setDuplicado] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open || !solicitud) return
    setForm({
      nombre: solicitud.nombre ?? '',
      phone: cleanPhone(solicitud.phone ?? ''),
      email: solicitud.email ?? '',
      provincia: solicitud.provincia ?? '',
      ubicacion: solicitud.ubicacion ?? '',
    })
    setErrors({})
    setFormError('')
    setDuplicado(false)
  }, [open, solicitud])

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function validate() {
    const e = {}
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio.'
    const phone = validatePhone(form.phone)
    if (phone) e.phone = phone
    const email = validateEmail(form.email)
    if (email) e.email = email
    if (!form.ubicacion.trim()) e.ubicacion = 'La ubicación es obligatoria.'
    return e
  }

  async function onSubmit(ev) {
    ev.preventDefault()
    const errs = validate()
    setErrors(errs)
    setFormError('')
    setDuplicado(false)
    if (Object.keys(errs).length) return

    setSubmitting(true)
    try {
      // Sin documento a propósito: lo pone el backend desde la solicitud.
      const result = await aprobarSolicitud(solicitud.id, {
        nombre: form.nombre.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        provincia: form.provincia.trim() || null,
        ubicacion: form.ubicacion.trim(),
      })
      onAprobada(result)
    } catch (err) {
      if (err.status === 400 && err.details) {
        setErrors((prev) => ({ ...prev, ...mapDetails(err.details) }))
        setFormError(err.message || 'Revisa los campos marcados.')
      } else if (err.status === 409) {
        // Cédula ya registrada como cliente: no se puede aprobar, hay que rechazar.
        setDuplicado(true)
        setFormError(err.message)
      } else {
        setFormError(err.message || 'No se pudo aprobar la solicitud.')
      }
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
      size="lg"
      title="Aprobar solicitud y crear cliente"
      footer={
        duplicado ? (
          <>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cerrar
            </Button>
            <Button variant="danger" onClick={() => onRechazarEnVez?.()}>
              Rechazar esta solicitud
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={onClose} disabled={submitting}>
              Cancelar
            </Button>
            <Button type="submit" form="aprobar-form" loading={submitting}>
              Aprobar y crear cliente
            </Button>
          </>
        )
      }
    >
      <form id="aprobar-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}

        {/* Documento: SOLO LECTURA, resaltado como no editable. */}
        <div className="rounded-btn border border-dashed border-edge bg-edge-soft/50 px-3.5 py-2.5">
          <div className="text-[10px] font-bold uppercase tracking-wide text-faint">
            Documento · no editable
          </div>
          <div className="mt-0.5 text-sm font-medium text-brand-text">
            {docLabel(solicitud.documentType)} {solicitud.documentNumber}
          </div>
          <p className="mt-1 text-xs text-muted">
            Es el identificador del cliente; no se cambia al aprobar.
          </p>
        </div>

        <Field id="ap-nombre" label="Nombre completo" error={errors.nombre}>
          <input
            id="ap-nombre"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
            className={inputCls(errors.nombre)}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field id="ap-phone" label="Teléfono" error={errors.phone}>
            <input
              id="ap-phone"
              inputMode="numeric"
              value={form.phone}
              onChange={(e) => set('phone', clampPhone(cleanPhone(e.target.value)))}
              className={inputCls(errors.phone)}
            />
          </Field>
          <Field id="ap-email" label="Correo (opcional)" error={errors.email}>
            <input
              id="ap-email"
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              className={inputCls(errors.email)}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field id="ap-provincia" label="Provincia (opcional)" error={errors.provincia}>
            <input
              id="ap-provincia"
              value={form.provincia}
              onChange={(e) => set('provincia', e.target.value)}
              className={inputCls(errors.provincia)}
            />
          </Field>
          <Field id="ap-ubicacion" label="Sector / dirección" error={errors.ubicacion}>
            <input
              id="ap-ubicacion"
              value={form.ubicacion}
              onChange={(e) => set('ubicacion', e.target.value)}
              className={inputCls(errors.ubicacion)}
            />
          </Field>
        </div>
        <p className="text-xs text-muted">
          La provincia se añade a la dirección del cliente.
        </p>
      </form>
    </Modal>
  )
}

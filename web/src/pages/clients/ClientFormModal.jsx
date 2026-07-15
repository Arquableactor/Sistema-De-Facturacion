import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { createClient, updateClient } from '../../api/clientsApi.js'
import { mapDetails } from '../../lib/apiErrors.js'

// Reglas de documento por tipo — ESPEJO de ClientDocumentRules en el backend.
// Cédula y RNC son numéricos puros; el pasaporte es alfanumérico de 6 a 15.
const DOC_TYPES = [
  { value: 'Cedula', label: 'Cédula', digits: 11 },
  { value: 'Rnc', label: 'RNC', digits: 9 },
  { value: 'Passport', label: 'Pasaporte' },
]
const DOC_META = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d]))
const PASSPORT_MAX = 15
const PHONE_DIGITS = 10

const onlyDigits = (v) => String(v ?? '').replace(/\D/g, '')
const onlyAlnum = (v) => String(v ?? '').replace(/[^A-Za-z0-9]/g, '')

// LIMPIAR ≠ RECORTAR, y la diferencia importa:
//  - limpiar (quitar guiones/espacios/letras según el tipo) NO pierde información;
//  - recortar al largo del tipo SÍ la pierde.
// Por eso solo recortamos mientras el usuario TECLEA (ve el tope en vivo). Al CARGAR
// un valor guardado nunca recortamos: si la fila vieja trae 12 dígitos, se muestran los
// 12 y la validación lo marca. Recortarlos daría un número distinto y "válido" que se
// guardaría en silencio, justo el tipo de bug que esta sesión vino a eliminar.
function cleanDocument(value, type) {
  const meta = DOC_META[type]
  if (!meta) return String(value ?? '').trim()
  return meta.digits ? onlyDigits(value) : onlyAlnum(value)
}

function clampDocument(value, type) {
  const meta = DOC_META[type]
  if (!meta) return value
  return value.slice(0, meta.digits ?? PASSPORT_MAX)
}

const cleanPhone = onlyDigits
const clampPhone = (value) => value.slice(0, PHONE_DIGITS)

const EMPTY = {
  name: '',
  documentType: '',
  documentNumber: '',
  // Lo que el usuario tecleó/lo que vino de la DB, SIN limpiar por tipo. Cambiar de tipo
  // re-deriva el número desde aquí: si no, pasar Pasaporte "AB123456" -> Cédula ("123456")
  // -> Pasaporte destruía las letras para siempre, y "123456" es un pasaporte válido, así
  // que se guardaba un documento equivocado sin un solo error.
  documentRaw: '',
  phone: '',
  email: '',
  installationAddress: '',
}

function validateDocument(f) {
  if (!f.documentNumber.trim()) return 'El documento es obligatorio.'
  const meta = DOC_META[f.documentType]
  if (!meta) return undefined // sin tipo elegido ya se reporta en documentType
  if (meta.digits) {
    if (!/^\d+$/.test(f.documentNumber) || f.documentNumber.length !== meta.digits) {
      return `${meta.label} debe tener exactamente ${meta.digits} dígitos, sin letras ni guiones.`
    }
    return undefined
  }
  if (!/^[A-Za-z0-9]{6,15}$/.test(f.documentNumber)) {
    return 'El pasaporte debe ser alfanumérico de 6 a 15 caracteres.'
  }
  return undefined
}

function validate(f) {
  const e = {}
  if (!f.name.trim()) e.name = 'El nombre es obligatorio.'
  if (!f.documentType) e.documentType = 'Selecciona el tipo de documento.'
  const doc = validateDocument(f)
  if (doc) e.documentNumber = doc
  if (!f.phone.trim()) e.phone = 'El teléfono es obligatorio.'
  else if (!/^\d{10}$/.test(f.phone)) e.phone = 'El teléfono debe tener exactamente 10 dígitos.'
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
            // Limpiamos (quitar guiones) pero NO recortamos: hay filas antiguas con
            // guiones ("809-555-0100" -> "8095550100", intacto) y otras fuera de norma,
            // que deben verse tal cual para que la validación las marque.
            documentNumber: cleanDocument(client.documentNumber ?? '', client.documentType),
            documentRaw: client.documentNumber ?? '',
            phone: cleanPhone(client.phone ?? ''),
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

  // Al cambiar el tipo re-derivamos el número desde el RAW, no desde el valor ya limpio:
  // así ir a Cédula y volver a Pasaporte recupera las letras en vez de perderlas.
  function setDocumentType(type) {
    setForm((f) => ({ ...f, documentType: type, documentNumber: cleanDocument(f.documentRaw, type) }))
  }

  // Al teclear sí recortamos al largo del tipo: el tope se ve en vivo, no es silencioso.
  function setDocumentNumber(value) {
    setForm((f) => ({
      ...f,
      documentRaw: value,
      documentNumber: clampDocument(cleanDocument(value, f.documentType), f.documentType),
    }))
  }

  // La etiqueta y el placeholder del documento se adaptan al tipo elegido.
  const docMeta = DOC_META[form.documentType]
  const docPlaceholder = docMeta
    ? docMeta.digits
      ? `${docMeta.digits} dígitos`
      : 'AB123456'
    : 'Selecciona el tipo primero'

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
              onChange={(e) => setDocumentType(e.target.value)}
              className={`w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors focus:ring-2 ${
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
            label={docMeta ? `Número de ${docMeta.label.toLowerCase()}` : 'Número de documento'}
            inputMode={docMeta?.digits ? 'numeric' : 'text'}
            value={form.documentNumber}
            onChange={(e) => setDocumentNumber(e.target.value)}
            error={errors.documentNumber}
            placeholder={docPlaceholder}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Sin maxLength a propósito: el navegador lo aplicaría al texto CRUDO y al
              pegar "809-555-0100" (12 chars) lo cortaría a "809-555-01" perdiendo
              dígitos. sanitizePhone ya limita a 10 DÍGITOS después de quitar la basura. */}
          <Field
            id="phone"
            label="Teléfono"
            inputMode="numeric"
            value={form.phone}
            onChange={(e) => set('phone', clampPhone(cleanPhone(e.target.value)))}
            error={errors.phone}
            placeholder="8090000000"
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

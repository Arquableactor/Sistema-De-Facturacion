// Reglas de documento y teléfono (RD) del lado del cliente — ESPEJO de
// DTOs/Shared/DocumentRules.cs y PhoneRdAttribute.cs en el backend.
//
// COMPARTIDO por el alta de clientes (app interna) y por la solicitud pública de
// captación: una solicitud aprobada se convierte en Client, así que si el formulario
// público aceptara lo que Client rechaza, la aprobación reventaría. Una regla, un sitio.
export const DOC_TYPES = [
  { value: 'Cedula', label: 'Cédula', digits: 11 },
  { value: 'Rnc', label: 'RNC', digits: 9 },
  { value: 'Passport', label: 'Pasaporte' },
]
export const DOC_META = Object.fromEntries(DOC_TYPES.map((d) => [d.value, d]))
export const PASSPORT_MAX = 15
export const PHONE_DIGITS = 10

const onlyDigits = (v) => String(v ?? '').replace(/\D/g, '')
const onlyAlnum = (v) => String(v ?? '').replace(/[^A-Za-z0-9]/g, '')

// LIMPIAR ≠ RECORTAR, y la diferencia importa:
//  - limpiar (quitar guiones/espacios/letras según el tipo) NO pierde información;
//  - recortar al largo del tipo SÍ la pierde.
// Por eso solo se recorta mientras el usuario TECLEA (ve el tope en vivo). Al CARGAR
// un valor guardado nunca se recorta: si la fila vieja trae 12 dígitos, se muestran los
// 12 y la validación lo marca. Recortarlos daría un número distinto y "válido" que se
// guardaría en silencio.
export function cleanDocument(value, type) {
  const meta = DOC_META[type]
  if (!meta) return String(value ?? '').trim()
  return meta.digits ? onlyDigits(value) : onlyAlnum(value)
}

export function clampDocument(value, type) {
  const meta = DOC_META[type]
  if (!meta) return value
  return value.slice(0, meta.digits ?? PASSPORT_MAX)
}

export const cleanPhone = onlyDigits
export const clampPhone = (value) => value.slice(0, PHONE_DIGITS)

// Devuelve el mensaje de error, o undefined si es válido.
export function validateDocument(documentNumber, documentType) {
  const value = String(documentNumber ?? '')
  if (!value.trim()) return 'El documento es obligatorio.'
  const meta = DOC_META[documentType]
  if (!meta) return undefined // sin tipo elegido, eso se reporta aparte
  if (meta.digits) {
    if (!/^\d+$/.test(value) || value.length !== meta.digits) {
      return `${meta.label} debe tener exactamente ${meta.digits} dígitos, sin letras ni guiones.`
    }
    return undefined
  }
  if (!/^[A-Za-z0-9]{6,15}$/.test(value)) {
    return 'El pasaporte debe ser alfanumérico de 6 a 15 caracteres.'
  }
  return undefined
}

export function validatePhone(phone) {
  const value = String(phone ?? '')
  if (!value.trim()) return 'El teléfono es obligatorio.'
  if (!/^\d{10}$/.test(value)) return 'El teléfono debe tener exactamente 10 dígitos.'
  return undefined
}

export function validateEmail(email) {
  const value = String(email ?? '').trim()
  if (!value) return undefined // opcional en ambos formularios
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Correo electrónico inválido.'
  return undefined
}

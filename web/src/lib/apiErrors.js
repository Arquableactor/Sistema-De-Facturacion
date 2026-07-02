// Normaliza el envelope de validación del backend ({ "Campo": ["msg", ...] }) a
// errores por campo para los formularios: baja la inicial de la clave (PascalCase ->
// camelCase, ej. "Email" -> "email") y une los mensajes. Compartido por todos los modales.
export function mapDetails(details) {
  const map = {}
  if (details && typeof details === 'object') {
    for (const [k, v] of Object.entries(details)) {
      const key = k.charAt(0).toLowerCase() + k.slice(1)
      map[key] = Array.isArray(v) ? v.join(' ') : String(v)
    }
  }
  return map
}

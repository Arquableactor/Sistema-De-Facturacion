// Espeja la matriz de permisos del backend (Admin / Sales / Technician). La UI OCULTA
// lo que el rol no puede hacer; el backend IGUAL protege (403), así que esto es solo
// experiencia de usuario, no seguridad. Una acción que no esté aquí se considera
// permitida para cualquier autenticado (igual que un [Authorize] a secas en la API).
export const PERMISSIONS = {
  'clients.write': ['Admin', 'Sales'], // crear / editar / eliminar cliente
  'products.write': ['Admin'], // crear / editar / eliminar producto (catálogo)
  'projects.write': ['Admin', 'Sales'], // crear / editar proyecto
  'projects.delete': ['Admin'], // eliminar proyecto
  'equipos.register': ['Admin', 'Technician'], // registrar equipo instalado (no Facturación)
  'invoices.create': ['Admin', 'Sales'],
  'invoices.issue': ['Admin', 'Sales'],
  'payments.register': ['Admin', 'Sales'],
  'payments.void': ['Admin'], // anular pago: solo Admin
  'warranties.generate': ['Admin', 'Technician'], // generar garantía (no Facturación)
  'users.manage': ['Admin'], // gestión de usuarios
}

// ¿Puede `role` ejecutar `action`? Acción no listada => permitida.
export function can(role, action) {
  const allowed = PERMISSIONS[action]
  if (!allowed) return true
  return allowed.includes(role)
}

// Etiquetas en español del rol (para mostrar). El valor interno es el enum del backend.
export const ROLE_LABELS = {
  Admin: 'Administrador',
  Sales: 'Facturación',
  Technician: 'Técnico',
}

// Opciones para los selects de rol.
export const ROLE_OPTIONS = [
  { value: 'Admin', label: ROLE_LABELS.Admin },
  { value: 'Sales', label: ROLE_LABELS.Sales },
  { value: 'Technician', label: ROLE_LABELS.Technician },
]

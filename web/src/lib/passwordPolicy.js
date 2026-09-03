// Refleja PasswordPolicy del backend (que es la AUTORIDAD; esto es solo la ayuda visual y la
// validación previa al envío). Las reglas usan las MISMAS clases ASCII que el backend
// ([A-Z], [a-z], [0-9], [^A-Za-z0-9]) para que back y front nunca discrepen.
export const PASSWORD_RULES = [
  { key: 'length', label: 'Al menos 8 caracteres', test: (p) => p.length >= 8 },
  { key: 'upper', label: 'Una letra mayúscula (A-Z)', test: (p) => /[A-Z]/.test(p) },
  { key: 'lower', label: 'Una letra minúscula (a-z)', test: (p) => /[a-z]/.test(p) },
  { key: 'digit', label: 'Un número (0-9)', test: (p) => /[0-9]/.test(p) },
  { key: 'special', label: 'Un carácter especial (!@#$…)', test: (p) => /[^A-Za-z0-9]/.test(p) },
]

// true si la contraseña cumple TODAS las reglas.
export function isPasswordStrong(password) {
  const p = password || ''
  return PASSWORD_RULES.every((r) => r.test(p))
}

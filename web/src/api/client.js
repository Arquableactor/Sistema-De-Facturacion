// Cliente central de API. Usa rutas relativas (/api/...) que el proxy de Vite
// reenvía al backend (VITE_API_URL) -> mismo origen, sin CORS.

const TOKEN_KEY = 'ape_token'
const USER_KEY = 'ape_user'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function getStoredUser() {
  const raw = localStorage.getItem(USER_KEY)
  try {
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}

// Error de API con el mensaje del envelope { message } del backend.
export class ApiError extends Error {
  constructor(message, status, details) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.details = details
  }
}

async function request(method, path, body) {
  const token = getToken()
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  // 401 en una petición AUTENTICADA = sesión expirada/ inválida -> limpiar y a /login.
  // (El login no manda token, así que su 401 NO dispara esto: muestra el error.)
  if (res.status === 401 && token) {
    clearSession()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new ApiError('Sesión expirada. Inicia sesión de nuevo.', 401)
  }

  if (res.status === 204) return null

  const isJson = (res.headers.get('content-type') || '').includes('application/json')
  const payload = isJson ? await res.json().catch(() => null) : await res.text()

  if (!res.ok) {
    const message = (isJson && payload && payload.message) || 'Ocurrió un error inesperado.'
    throw new ApiError(message, res.status, isJson ? payload?.details : null)
  }

  return payload
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  patch: (path, body) => request('PATCH', path, body),
  del: (path) => request('DELETE', path),
}

// Descarga de binarios (ej. PDF). Mismo Bearer + manejo de 401 que request(), pero
// devuelve un Blob. Genérico: lo reusan Facturas y Garantías (certificado).
export async function getBlob(path) {
  const token = getToken()
  const headers = {}
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(path, { headers })

  if (res.status === 401 && token) {
    clearSession()
    if (window.location.pathname !== '/login') {
      window.location.assign('/login')
    }
    throw new ApiError('Sesión expirada. Inicia sesión de nuevo.', 401)
  }

  if (!res.ok) {
    // El backend puede devolver un envelope JSON de error incluso en endpoints de archivo.
    let message = 'No se pudo descargar el archivo.'
    try {
      const j = await res.json()
      if (j && j.message) message = j.message
    } catch {
      // respuesta sin JSON
    }
    throw new ApiError(message, res.status)
  }

  return res.blob()
}

// Dispara la descarga de un Blob en el navegador con el nombre dado.
export function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

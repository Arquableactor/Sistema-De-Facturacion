import { api } from './client.js'

// Lectura de usuarios para poblar selects (ej. responsable de proyecto).
export function getUsers(onlyActive = true) {
  return api.get(`/api/users${onlyActive ? '' : '?onlyActive=false'}`)
}

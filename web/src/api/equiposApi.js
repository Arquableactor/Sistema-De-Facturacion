import { api } from './client.js'

// Equipos instalados: cuelgan de un proyecto (registrar + listar; el backend no
// tiene editar/borrar).
export function getEquiposByProject(projectId) {
  return api.get(`/api/projects/${projectId}/equipos`)
}

export function createEquipo(projectId, data) {
  return api.post(`/api/projects/${projectId}/equipos`, data)
}

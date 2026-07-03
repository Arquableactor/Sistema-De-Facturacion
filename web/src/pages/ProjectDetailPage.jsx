import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { money, date, formatWarranty } from '../lib/format.js'
import { getProject } from '../api/projectsApi.js'
import { getEquiposByProject } from '../api/equiposApi.js'
import ProjectFormModal from './projects/ProjectFormModal.jsx'
import StageProgressModal from './projects/StageProgressModal.jsx'
import EquipoFormModal from './projects/EquipoFormModal.jsx'
import { stageMeta, ProgressBar } from './projects/projectMeta.jsx'
import ProjectWarrantyBlock from './warranties/ProjectWarrantyBlock.jsx'

function Info({ label, value, children }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className="mt-0.5 text-sm text-brand-text">{children ?? value}</div>
    </div>
  )
}

function FuturePanel({ title }) {
  return (
    <div className="grid place-items-center rounded-card border border-dashed border-edge bg-surface py-10 text-center">
      <div>
        <div className="font-display text-sm font-semibold text-brand-text">{title}</div>
        <p className="mt-1 text-xs text-muted">Próximamente</p>
      </div>
    </div>
  )
}

export default function ProjectDetailPage() {
  const { id } = useParams()
  const toast = useToast()

  const { data: project, loading, error, reload: reloadProject } = useApi(() => getProject(id), [id])
  const {
    data: equipos,
    loading: equiposLoading,
    error: equiposError,
    reload: reloadEquipos,
  } = useApi(() => getEquiposByProject(id), [id])

  const [editOpen, setEditOpen] = useState(false)
  const [stageOpen, setStageOpen] = useState(false)
  const [equipoOpen, setEquipoOpen] = useState(false)

  const list = equipos || []

  function onProjectSaved() {
    setEditOpen(false)
    reloadProject()
    toast.success('Proyecto actualizado.')
  }

  function onStageSaved() {
    setStageOpen(false)
    reloadProject()
    toast.success('Etapa y progreso actualizados.')
  }

  function onEquipoSaved() {
    setEquipoOpen(false)
    reloadEquipos()
    toast.success('Equipo registrado.')
  }

  return (
    <>
      <Topbar
        title="Detalle de proyecto"
        subtitle="Hub del proyecto"
        action={
          <Link
            to="/proyectos"
            className="inline-flex items-center rounded-btn px-3 py-2 text-sm font-medium text-muted hover:bg-edge-soft"
          >
            ← Proyectos
          </Link>
        }
      />

      <div className="space-y-6 p-6">
        <DataState loading={loading} error={error} empty={false} onRetry={reloadProject}>
          {project && (
            <>
              {/* Cabecera */}
              <div className="rounded-card border border-edge bg-surface p-6 shadow-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="font-display text-2xl font-semibold text-brand-text">
                        {project.nombre}
                      </h1>
                      <Badge tone={stageMeta(project.etapa).tone}>{stageMeta(project.etapa).label}</Badge>
                      <Badge tone={project.isActive ? 'green' : 'gray'}>
                        {project.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted">Proyecto #{project.id}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <Button variant="ghost" onClick={() => setEditOpen(true)}>
                      Editar
                    </Button>
                    <Button variant="ghost" onClick={() => setStageOpen(true)}>
                      Etapa/Progreso
                    </Button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4 sm:grid-cols-3 lg:grid-cols-4">
                  <Info label="Cliente" value={project.clientName} />
                  <Info label="Responsable" value={project.responsableName} />
                  <Info label="Capacidad" value={`${project.capacidadKwp} kWp`} />
                  <Info label="Progreso">
                    <ProgressBar value={project.progreso} />
                  </Info>
                  <Info label="Fecha inicio" value={date(project.fechaInicio)} />
                  <Info label="Fecha clave" value={project.fechaClave ? date(project.fechaClave) : '—'} />
                  <Info label="Costo" value={money(project.costo)} />
                  <Info label="Presupuesto" value={money(project.presupuesto)} />
                </div>

                {project.notes && (
                  <div className="mt-5 border-t border-edge pt-4">
                    <div className="text-xs font-medium uppercase tracking-wide text-faint">Notas</div>
                    <p className="mt-1 text-sm text-muted">{project.notes}</p>
                  </div>
                )}
              </div>

              {/* Equipos instalados */}
              <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
                <div className="flex items-center justify-between gap-4 border-b border-edge px-6 py-4">
                  <div>
                    <h2 className="font-display text-base font-semibold text-brand-text">
                      Equipos instalados
                    </h2>
                    <p className="text-sm text-muted">
                      {equiposLoading ? 'Cargando…' : `${list.length} equipo${list.length === 1 ? '' : 's'}`}
                    </p>
                  </div>
                  <span title={project.isActive ? undefined : 'El proyecto está inactivo'}>
                    <Button onClick={() => setEquipoOpen(true)} disabled={!project.isActive}>
                      + Registrar equipo
                    </Button>
                  </span>
                </div>

                <div className="p-6">
                  {!project.isActive && (
                    <p className="mb-3 text-xs text-muted">
                      El proyecto está inactivo: no se pueden registrar equipos.
                    </p>
                  )}
                  <DataState
                    loading={equiposLoading}
                    error={equiposError}
                    empty={list.length === 0}
                    onRetry={reloadEquipos}
                    emptyText="No hay equipos registrados en este proyecto."
                  >
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                          <tr>
                            <th className="px-4 py-3 font-semibold">Producto</th>
                            <th className="px-4 py-3 font-semibold">Marca / Modelo</th>
                            <th className="px-4 py-3 font-semibold">Nº de serie</th>
                            <th className="px-4 py-3 font-semibold">Garantía</th>
                            <th className="px-4 py-3 font-semibold">Instalación</th>
                          </tr>
                        </thead>
                        <tbody>
                          {list.map((eq) => (
                            <tr key={eq.id} className="border-t border-edge hover:bg-edge-soft/40">
                              <td className="px-4 py-3 font-medium text-brand-text">{eq.productName}</td>
                              <td className="px-4 py-3 text-muted">
                                {[eq.marca, eq.modelo].filter(Boolean).join(' · ') || '—'}
                              </td>
                              <td className="px-4 py-3 font-mono text-xs text-muted">{eq.serialNumber}</td>
                              <td className="px-4 py-3 text-muted">{formatWarranty(eq.warrantyMonths)}</td>
                              <td className="px-4 py-3 text-muted">{date(eq.fechaInstalacion)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </DataState>
                </div>
              </div>

              {/* Facturas del proyecto: futuro */}
              <FuturePanel title="Facturas del proyecto" />

              {/* Garantía: bloque vivo (generar / mostrar / descargar) */}
              <ProjectWarrantyBlock projectId={project.id} equiposCount={list.length} />

              {/* Modales reutilizados */}
              <ProjectFormModal
                open={editOpen}
                project={project}
                onClose={() => setEditOpen(false)}
                onSaved={onProjectSaved}
              />
              <StageProgressModal
                open={stageOpen}
                project={project}
                onClose={() => setStageOpen(false)}
                onSaved={onStageSaved}
              />
              <EquipoFormModal
                open={equipoOpen}
                projectId={project.id}
                onClose={() => setEquipoOpen(false)}
                onSaved={onEquipoSaved}
              />
            </>
          )}
        </DataState>

        {/* Si el proyecto no existe / error: vuelta a la lista */}
        {error && (
          <div className="text-center">
            <Link to="/proyectos" className="text-sm font-medium text-primary hover:underline">
              ← Volver a la lista de proyectos
            </Link>
          </div>
        )}
      </div>
    </>
  )
}

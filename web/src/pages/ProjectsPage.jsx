import { useState } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ActionMenu from '../components/ui/ActionMenu.jsx'
import TruncatedText from '../components/ui/TruncatedText.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import { money } from '../lib/format.js'
import { getProjects, deleteProject } from '../api/projectsApi.js'
import ProjectFormModal from './projects/ProjectFormModal.jsx'
import StageProgressModal from './projects/StageProgressModal.jsx'
import { stageMeta, ProgressBar } from './projects/projectMeta.jsx'

export default function ProjectsPage() {
  const toast = useToast()
  const { can } = useAuth()
  const canWrite = can('projects.write') // crear / editar
  const canDelete = can('projects.delete')
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getProjects(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [stageProject, setStageProject] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const projects = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(project) {
    setEditing(project)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Proyecto actualizado.' : 'Proyecto creado.')
  }

  function onStageSaved() {
    setStageProject(null)
    reload()
    toast.success('Etapa y progreso actualizados.')
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteProject(toDelete.id)
      toast.success('Proyecto eliminado.')
      setToDelete(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'No se pudo eliminar.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <>
      <Topbar
        title="Proyectos"
        subtitle="Instalaciones solares: el centro del sistema"
        action={canWrite ? <Button onClick={openCreate}>+ Nuevo proyecto</Button> : null}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${projects.length} proyecto${projects.length === 1 ? '' : 's'}`}
          </p>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
            <input
              type="checkbox"
              checked={includeInactive}
              onChange={(e) => setIncludeInactive(e.target.checked)}
              className="h-4 w-4 rounded border-edge text-primary focus:ring-primary/30"
            />
            Incluir inactivos
          </label>
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={projects.length === 0}
          onRetry={reload}
          emptyText="No hay proyectos aún. Crea el primero con «Nuevo proyecto»."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Proyecto</th>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 text-right font-semibold">kWp</th>
                    <th className="px-4 py-3 font-semibold">Etapa</th>
                    <th className="px-4 py-3 font-semibold">Progreso</th>
                    <th className="px-4 py-3 font-semibold">Responsable</th>
                    <th className="px-4 py-3 text-right font-semibold">Costo / Presup.</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {projects.map((p) => {
                    const stage = stageMeta(p.etapa)
                    return (
                      <tr key={p.id} className="border-t border-edge hover:bg-edge-soft/40">
                        <td className="px-4 py-3 font-medium">
                          {/* El nombre largo se trunca; el click en el texto lo expande
                              (por eso TruncatedText detiene la propagación al enlace). */}
                          <Link
                            to={`/proyectos/${p.id}`}
                            className="text-primary hover:underline"
                          >
                            <TruncatedText text={p.nombre} />
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted">{p.clientName}</td>
                        <td className="px-4 py-3 text-right tabular text-muted">{p.capacidadKwp}</td>
                        <td className="px-4 py-3">
                          <Badge tone={stage.tone}>{stage.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <ProgressBar value={p.progreso} />
                        </td>
                        <td className="px-4 py-3 text-muted">{p.responsableName}</td>
                        <td className="px-4 py-3 text-right tabular">
                          <div className="text-brand-text">{money(p.costo)}</div>
                          <div className="text-xs text-faint">{money(p.presupuesto)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={p.isActive ? 'green' : 'gray'}>
                            {p.isActive ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <ActionMenu
                              label={`Acciones de ${p.nombre}`}
                              items={[
                                canWrite && { label: 'Editar', onClick: () => openEdit(p) },
                                // Etapa/progreso: los tres roles pueden.
                                { label: 'Etapa y progreso', onClick: () => setStageProject(p) },
                                canDelete &&
                                  p.isActive && {
                                    label: 'Eliminar',
                                    tone: 'danger',
                                    onClick: () => setToDelete(p),
                                  },
                              ]}
                            />
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </DataState>
      </div>

      <ProjectFormModal
        open={modalOpen}
        project={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <StageProgressModal
        open={!!stageProject}
        project={stageProject}
        onClose={() => setStageProject(null)}
        onSaved={onStageSaved}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar proyecto"
        message={`¿Eliminar «${toDelete?.nombre}»? Pasará a inactivo y dejará de aparecer en la lista activa.`}
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  )
}

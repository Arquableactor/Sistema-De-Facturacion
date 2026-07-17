import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { getAppliancesAdmin, deleteAppliance } from '../api/appliancesApi.js'
import ApplianceFormModal from './catalogo/ApplianceFormModal.jsx'

// CRUD del catálogo de electrodomésticos (solo Admin). Alimenta el estimado del
// formulario público. Editar los watts no cambia solicitudes ya enviadas (snapshot).
export default function CatalogoPage() {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getAppliancesAdmin(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDeactivate, setToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  const items = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(appliance) {
    setEditing(appliance)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Electrodoméstico actualizado.' : 'Electrodoméstico creado.')
  }

  async function confirmDeactivate() {
    setDeactivating(true)
    try {
      await deleteAppliance(toDeactivate.id)
      toast.success('Electrodoméstico desactivado.')
      setToDeactivate(null)
      reload()
    } catch (err) {
      toast.error(err.message || 'No se pudo desactivar.')
      setToDeactivate(null)
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <>
      <Topbar
        title="Catálogo"
        subtitle="Electrodomésticos y sus watts para el estimado de la captación"
        action={<Button onClick={openCreate}>+ Nuevo electrodoméstico</Button>}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${items.length} electrodoméstico${items.length === 1 ? '' : 's'}`}
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
          empty={items.length === 0}
          onRetry={reload}
          emptyText="No hay electrodomésticos. Crea el primero con «Nuevo electrodoméstico»."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 text-right font-semibold">Watts</th>
                    <th className="px-4 py-3 text-right font-semibold">Horas/día sug.</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((a) => (
                    <tr key={a.id} className="border-t border-edge hover:bg-edge-soft/40">
                      <td className="px-4 py-3 font-medium text-brand-text">{a.nombre}</td>
                      <td className="px-4 py-3 text-muted">{a.categoria || '—'}</td>
                      <td className="px-4 py-3 text-right tabular text-muted">{a.wattsTipicos}</td>
                      <td className="px-4 py-3 text-right tabular text-muted">{a.horasPorDiaSugeridas}</td>
                      <td className="px-4 py-3">
                        <Badge tone={a.isActive ? 'green' : 'gray'}>
                          {a.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(a)}>
                            Editar
                          </Button>
                          {a.isActive && (
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                              onClick={() => setToDeactivate(a)}
                            >
                              Desactivar
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </DataState>
      </div>

      <ApplianceFormModal
        open={modalOpen}
        appliance={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={!!toDeactivate}
        title="Desactivar electrodoméstico"
        message={`¿Desactivar «${toDeactivate?.nombre}»? Dejará de ofrecerse en el formulario público. Las solicitudes ya enviadas conservan su registro.`}
        confirmText="Desactivar"
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => !deactivating && setToDeactivate(null)}
      />
    </>
  )
}

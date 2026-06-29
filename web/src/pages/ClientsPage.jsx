import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { getClients, deleteClient } from '../api/clientsApi.js'
import ClientFormModal from './clients/ClientFormModal.jsx'

const DOC_LABEL = { Cedula: 'Cédula', Rnc: 'RNC', Passport: 'Pasaporte' }

export default function ClientsPage() {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getClients(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const clients = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(client) {
    setEditing(client)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Cliente actualizado.' : 'Cliente creado.')
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteClient(toDelete.id)
      toast.success('Cliente eliminado.')
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
        title="Clientes"
        subtitle="Gestiona los clientes del negocio"
        action={<Button onClick={openCreate}>+ Nuevo cliente</Button>}
      />

      <div className="space-y-4 p-6">
        {/* Barra de herramientas */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${clients.length} cliente${clients.length === 1 ? '' : 's'}`}
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
          empty={clients.length === 0}
          onRetry={reload}
          emptyText="No hay clientes aún. Crea el primero con «Nuevo cliente»."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Documento</th>
                    <th className="px-4 py-3 font-semibold">Teléfono</th>
                    <th className="px-4 py-3 font-semibold">Email</th>
                    <th className="px-4 py-3 font-semibold">Dirección</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((c) => (
                    <tr key={c.id} className="border-t border-edge hover:bg-edge-soft/40">
                      <td className="px-4 py-3 font-medium text-brand-text">{c.name}</td>
                      <td className="px-4 py-3 text-muted">
                        <span className="text-faint">{DOC_LABEL[c.documentType] || c.documentType}</span>{' '}
                        {c.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-muted">{c.phone}</td>
                      <td className="px-4 py-3 text-muted">{c.email || '—'}</td>
                      <td className="max-w-[220px] truncate px-4 py-3 text-muted" title={c.installationAddress}>
                        {c.installationAddress}
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={c.isActive ? 'green' : 'gray'}>
                          {c.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(c)}>
                            Editar
                          </Button>
                          {c.isActive && (
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                              onClick={() => setToDelete(c)}
                            >
                              Eliminar
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

      <ClientFormModal
        open={modalOpen}
        client={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar cliente"
        message={`¿Eliminar a «${toDelete?.name}»? Pasará a inactivo y dejará de aparecer en la lista activa.`}
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  )
}

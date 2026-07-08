import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { getUsersManage, updateUser } from '../api/usersApi.js'
import { ROLE_LABELS } from '../auth/permissions.js'
import { date } from '../lib/format.js'
import UserFormModal from './users/UserFormModal.jsx'
import ResetPasswordModal from './users/ResetPasswordModal.jsx'

const ROLE_TONE = { Admin: 'purple', Sales: 'blue', Technician: 'amber' }

export default function UsersPage() {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getUsersManage(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [resetting, setResetting] = useState(null)
  const [toDeactivate, setToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  const users = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(user) {
    setEditing(user)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Usuario actualizado.' : 'Usuario creado.')
  }

  function onReset() {
    setResetting(null)
    toast.success('Contraseña restablecida.')
  }

  async function confirmDeactivate() {
    setDeactivating(true)
    try {
      await updateUser(toDeactivate.id, {
        fullName: toDeactivate.fullName,
        email: toDeactivate.email,
        role: toDeactivate.role,
        isActive: false,
      })
      toast.success('Usuario desactivado.')
      setToDeactivate(null)
      reload()
    } catch (err) {
      // 409 = protección del server (ej. "No puedes desactivar tu propia cuenta." /
      // "Debe existir al menos un administrador activo."). Mostramos su mensaje.
      toast.error(err.message || 'No se pudo desactivar.')
      setToDeactivate(null)
    } finally {
      setDeactivating(false)
    }
  }

  return (
    <>
      <Topbar
        title="Usuarios"
        subtitle="Gestiona el acceso y los roles del sistema"
        action={<Button onClick={openCreate}>+ Nuevo usuario</Button>}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${users.length} usuario${users.length === 1 ? '' : 's'}`}
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
          empty={users.length === 0}
          onRetry={reload}
          emptyText="No hay usuarios que mostrar."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Correo</th>
                    <th className="px-4 py-3 font-semibold">Rol</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 font-semibold">Creado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-edge hover:bg-edge-soft/40">
                      <td className="px-4 py-3 font-medium text-brand-text">{u.fullName}</td>
                      <td className="px-4 py-3 text-muted">{u.email}</td>
                      <td className="px-4 py-3">
                        <Badge tone={ROLE_TONE[u.role] || 'gray'}>
                          {ROLE_LABELS[u.role] || u.role}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={u.isActive ? 'green' : 'gray'}>
                          {u.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-muted">{date(u.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(u)}>
                            Editar
                          </Button>
                          <Button
                            variant="ghost"
                            className="px-2.5 py-1.5"
                            onClick={() => setResetting(u)}
                          >
                            Restablecer contraseña
                          </Button>
                          {u.isActive && (
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                              onClick={() => setToDeactivate(u)}
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

      <UserFormModal
        open={modalOpen}
        user={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ResetPasswordModal
        open={!!resetting}
        user={resetting}
        onClose={() => setResetting(null)}
        onDone={onReset}
      />

      <ConfirmDialog
        open={!!toDeactivate}
        title="Desactivar usuario"
        message={`¿Desactivar a «${toDeactivate?.fullName}»? No podrá iniciar sesión hasta reactivarlo.`}
        confirmText="Desactivar"
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => !deactivating && setToDeactivate(null)}
      />
    </>
  )
}

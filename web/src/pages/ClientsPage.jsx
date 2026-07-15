import { useMemo, useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import ActionMenu from '../components/ui/ActionMenu.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import { useAuth } from '../auth/AuthContext.jsx'
import useApi from '../hooks/useApi.js'
import { phone as formatPhone } from '../lib/format.js'
import { getClients, deleteClient } from '../api/clientsApi.js'
import ClientFormModal from './clients/ClientFormModal.jsx'

const DOC_LABEL = { Cedula: 'Cédula', Rnc: 'RNC', Passport: 'Pasaporte' }

// Normaliza para buscar sin acentos ni mayúsculas ("Ferretería" encuentra "ferreteria").
function normalize(text) {
  return String(text ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function SearchIcon() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-faint"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  )
}

export default function ClientsPage() {
  const toast = useToast()
  const { can } = useAuth()
  const canWrite = can('clients.write')
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getClients(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [query, setQuery] = useState('')

  const all = data || []
  // Filtro por nombre o documento, en cliente sobre la lista ya cargada (suficiente al
  // volumen actual). Los dígitos del documento se comparan sueltos para que "0016502"
  // encuentre "001-6502-1".
  // TODO: si la lista crece, mover la búsqueda al server (?q=) y paginar.
  const clients = useMemo(() => {
    const q = normalize(query).trim()
    if (!q) return all
    const qDigits = q.replace(/\D/g, '')
    return all.filter((c) => {
      if (normalize(c.name).includes(q)) return true
      if (normalize(c.documentNumber).includes(q)) return true
      const docDigits = String(c.documentNumber ?? '').replace(/\D/g, '')
      return qDigits.length > 0 && docDigits.includes(qDigits)
    })
  }, [all, query])

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
        action={canWrite ? <Button onClick={openCreate}>+ Nuevo cliente</Button> : null}
      />

      <div className="space-y-4 p-6">
        {/* Barra de herramientas: contador + búsqueda + toggle de inactivos */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* role=status: al filtrar, el lector de pantalla anuncia cuántos quedaron
              (si no, la búsqueda no da ninguna señal audible). */}
          <p className="text-sm text-muted" role="status" aria-live="polite">
            {loading
              ? 'Cargando…'
              : query
                ? `${clients.length} de ${all.length} cliente${all.length === 1 ? '' : 's'}`
                : `${clients.length} cliente${clients.length === 1 ? '' : 's'}`}
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <SearchIcon />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por nombre o documento…"
                aria-label="Buscar clientes por nombre o documento"
                className="w-72 rounded-btn border border-edge bg-surface py-2 pl-9 pr-3 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
              />
            </div>
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
        </div>

        <DataState
          loading={loading}
          error={error}
          empty={clients.length === 0}
          onRetry={reload}
          emptyText={
            query
              ? `Ningún cliente coincide con «${query}».`
              : 'No hay clientes aún. Crea el primero con «Nuevo cliente».'
          }
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
                      <td className="px-4 py-3 font-medium text-brand-text">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={c.name} size="sm" />
                          <span>{c.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted">
                        <span className="text-faint">{DOC_LABEL[c.documentType] || c.documentType}</span>{' '}
                        {c.documentNumber}
                      </td>
                      <td className="px-4 py-3 text-muted">{formatPhone(c.phone)}</td>
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
                        <div className="flex justify-end">
                          {canWrite ? (
                            <ActionMenu
                              label={`Acciones de ${c.name}`}
                              items={[
                                { label: 'Editar', onClick: () => openEdit(c) },
                                c.isActive && {
                                  label: 'Eliminar',
                                  tone: 'danger',
                                  onClick: () => setToDelete(c),
                                },
                              ]}
                            />
                          ) : (
                            <span className="text-faint">—</span>
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

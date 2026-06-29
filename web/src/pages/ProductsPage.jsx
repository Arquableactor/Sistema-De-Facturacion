import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { money, formatWarranty } from '../lib/format.js'
import { getProducts, deleteProduct } from '../api/productsApi.js'
import ProductFormModal from './products/ProductFormModal.jsx'

const CAT_LABEL = {
  PanelSolar: 'Panel solar',
  Inversor: 'Inversor',
  Bateria: 'Batería',
  Estructura: 'Estructura',
  Medidor: 'Medidor',
  Cableado: 'Cableado',
}

export default function ProductsPage() {
  const toast = useToast()
  const [includeInactive, setIncludeInactive] = useState(false)
  const { data, loading, error, reload } = useApi(
    () => getProducts(includeInactive),
    [includeInactive],
  )

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDelete, setToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const products = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(product) {
    setEditing(product)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Producto actualizado.' : 'Producto creado.')
  }

  async function confirmDelete() {
    setDeleting(true)
    try {
      await deleteProduct(toDelete.id)
      toast.success('Producto eliminado.')
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
        title="Equipos"
        subtitle="Catálogo de productos · el inventario de equipos instalados llegará en otra pestaña"
        action={<Button onClick={openCreate}>+ Nuevo producto</Button>}
      />

      <div className="space-y-4 p-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted">
            {loading ? 'Cargando…' : `${products.length} producto${products.length === 1 ? '' : 's'}`}
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
          empty={products.length === 0}
          onRetry={reload}
          emptyText="No hay productos aún. Crea el primero con «Nuevo producto»."
        >
          <div className="overflow-hidden rounded-card border border-edge bg-surface shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Nombre</th>
                    <th className="px-4 py-3 font-semibold">Código</th>
                    <th className="px-4 py-3 font-semibold">Categoría</th>
                    <th className="px-4 py-3 font-semibold">Marca / Modelo</th>
                    <th className="px-4 py-3 text-right font-semibold">Precio</th>
                    <th className="px-4 py-3 font-semibold">Garantía</th>
                    <th className="px-4 py-3 font-semibold">Serie</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t border-edge hover:bg-edge-soft/40">
                      <td className="px-4 py-3 font-medium text-brand-text">{p.name}</td>
                      <td className="px-4 py-3 font-mono text-xs text-muted">{p.code}</td>
                      <td className="px-4 py-3 text-muted">
                        {p.categoria ? CAT_LABEL[p.categoria] || p.categoria : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {[p.marca, p.modelo].filter(Boolean).join(' · ') || '—'}
                      </td>
                      <td className="px-4 py-3 text-right tabular text-brand-text">{money(p.price)}</td>
                      <td className="px-4 py-3 text-muted">{formatWarranty(p.warrantyMonths)}</td>
                      <td className="px-4 py-3">
                        <Badge tone={p.isSerialized ? 'blue' : 'gray'}>
                          {p.isSerialized ? 'Sí' : 'No'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge tone={p.isActive ? 'green' : 'gray'}>
                          {p.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(p)}>
                            Editar
                          </Button>
                          {p.isActive && (
                            <Button
                              variant="ghost"
                              className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                              onClick={() => setToDelete(p)}
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

      <ProductFormModal
        open={modalOpen}
        product={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={!!toDelete}
        title="Eliminar producto"
        message={`¿Eliminar «${toDelete?.name}» (${toDelete?.code})? Pasará a inactivo y dejará de aparecer en la lista activa.`}
        confirmText="Eliminar"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => !deleting && setToDelete(null)}
      />
    </>
  )
}

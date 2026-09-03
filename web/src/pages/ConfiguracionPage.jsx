import { useState } from 'react'
import Topbar from '../components/layout/Topbar.jsx'
import Button from '../components/ui/Button.jsx'
import Badge from '../components/ui/Badge.jsx'
import ActionMenu from '../components/ui/ActionMenu.jsx'
import ListCard from '../components/ui/ListCard.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import DataState from '../components/data/DataState.jsx'
import { useToast } from '../components/ui/Toast.jsx'
import useApi from '../hooks/useApi.js'
import { date } from '../lib/format.js'
import { estadoMeta } from '../lib/ncfMeta.js'
import { getNcfSequences, updateNcfSequence } from '../api/ncfSequencesApi.js'
import NcfSequenceFormModal from './configuracion/NcfSequenceFormModal.jsx'

// Configuración > Secuencias NCF (solo Admin). Administra los comprobantes fiscales que APE
// consume al emitir facturas, con sus rangos y vencimientos. La emisión (InvoiceService) es
// la única que avanza los números; aquí solo se administran datos y el estado activo.
export default function ConfiguracionPage() {
  const toast = useToast()
  const { data, loading, error, reload } = useApi(() => getNcfSequences(), [])

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [toDeactivate, setToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)

  const items = data || []

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(seq) {
    setEditing(seq)
    setModalOpen(true)
  }

  function onSaved(_saved, isEdit) {
    setModalOpen(false)
    reload()
    toast.success(isEdit ? 'Secuencia actualizada.' : 'Secuencia creada.')
  }

  async function confirmDeactivate() {
    setDeactivating(true)
    try {
      // Desactivar = PUT con isActive=false conservando el resto (no hay DELETE: histórico fiscal).
      await updateNcfSequence(toDeactivate.id, {
        numeroAutorizacion: toDeactivate.numeroAutorizacion,
        fechaVencimiento: toDeactivate.fechaVencimiento,
        isActive: false,
      })
      toast.success('Secuencia desactivada.')
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
        title="Configuración"
        subtitle="Secuencias de comprobantes fiscales (NCF)"
        action={<Button onClick={openCreate}>+ Nueva secuencia</Button>}
      />

      <div className="space-y-4 p-4 sm:p-6">
        <p className="text-sm text-muted">
          {loading
            ? 'Cargando…'
            : `${items.length} secuencia${items.length === 1 ? '' : 's'}`}
        </p>

        <DataState
          loading={loading}
          error={error}
          empty={items.length === 0}
          onRetry={reload}
          emptyText="No hay secuencias NCF. Registra la primera con «Nueva secuencia»."
        >
          {/* MÓVIL (< lg): tarjetas. */}
          <ul className="space-y-3 lg:hidden">
            {items.map((s) => {
              const est = estadoMeta(s.estado)
              return (
                <li key={s.id}>
                  <ListCard
                    title={s.type}
                    badge={<Badge tone={est.tone}>{est.label}</Badge>}
                    fields={[
                      {
                        label: 'N° autorización',
                        full: true,
                        value: <span className="font-mono">{s.numeroAutorizacion || '—'}</span>,
                      },
                      {
                        label: 'Rango',
                        full: true,
                        value: (
                          <span className="tabular">
                            {s.startNumber.toLocaleString('es-DO')} – {s.maxNumber.toLocaleString('es-DO')}
                          </span>
                        ),
                      },
                      {
                        label: 'Usados / Restantes',
                        full: true,
                        value: <UsageBar usados={s.usados} restantes={s.restantes} />,
                      },
                      {
                        label: 'Vence',
                        full: true,
                        value: <VenceCell fecha={s.fechaVencimiento} dias={s.diasParaVencer} />,
                      },
                    ]}
                    actions={
                      <ActionMenu
                        label={`Acciones de ${s.type}`}
                        items={[
                          { label: 'Editar', onClick: () => openEdit(s) },
                          s.isActive && { label: 'Desactivar', tone: 'danger', onClick: () => setToDeactivate(s) },
                        ]}
                      />
                    }
                  />
                </li>
              )
            })}
          </ul>

          {/* DESKTOP (>= lg): tabla idéntica. */}
          <div className="hidden overflow-hidden rounded-card border border-edge bg-surface shadow-card lg:block">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-edge-soft text-xs uppercase tracking-wide text-muted">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Tipo</th>
                    <th className="px-4 py-3 font-semibold">N° autorización</th>
                    <th className="px-4 py-3 font-semibold">Rango</th>
                    <th className="px-4 py-3 font-semibold">Usados / Restantes</th>
                    <th className="px-4 py-3 font-semibold">Vence</th>
                    <th className="px-4 py-3 font-semibold">Estado</th>
                    <th className="px-4 py-3 text-right font-semibold">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => {
                    const est = estadoMeta(s.estado)
                    return (
                      <tr key={s.id} className="border-t border-edge hover:bg-edge-soft/40">
                        <td className="px-4 py-3 font-medium text-brand-text">{s.type}</td>
                        <td className="px-4 py-3 font-mono text-xs text-muted">
                          {s.numeroAutorizacion || '—'}
                        </td>
                        <td className="px-4 py-3 tabular text-muted">
                          {s.startNumber.toLocaleString('es-DO')} – {s.maxNumber.toLocaleString('es-DO')}
                        </td>
                        <td className="px-4 py-3">
                          <UsageBar usados={s.usados} restantes={s.restantes} />
                        </td>
                        <td className="px-4 py-3">
                          <VenceCell fecha={s.fechaVencimiento} dias={s.diasParaVencer} />
                        </td>
                        <td className="px-4 py-3">
                          <Badge tone={est.tone}>{est.label}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" className="px-2.5 py-1.5" onClick={() => openEdit(s)}>
                              Editar
                            </Button>
                            {s.isActive && (
                              <Button
                                variant="ghost"
                                className="px-2.5 py-1.5 text-danger-strong hover:bg-danger-soft"
                                onClick={() => setToDeactivate(s)}
                              >
                                Desactivar
                              </Button>
                            )}
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

      <NcfSequenceFormModal
        open={modalOpen}
        sequence={editing}
        onClose={() => setModalOpen(false)}
        onSaved={onSaved}
      />

      <ConfirmDialog
        open={!!toDeactivate}
        title="Desactivar secuencia NCF"
        message={`¿Desactivar la secuencia «${toDeactivate?.type}»? Dejará de usarse al emitir facturas. No se borra: queda en el histórico y puedes reactivarla editándola.`}
        confirmText="Desactivar"
        loading={deactivating}
        onConfirm={confirmDeactivate}
        onCancel={() => !deactivating && setToDeactivate(null)}
      />
    </>
  )
}

// Barra de progreso usados/total con el detalle numérico al lado.
function UsageBar({ usados, restantes }) {
  const total = usados + restantes
  const pct = total > 0 ? Math.min(100, Math.max(0, (usados / total) * 100)) : 0
  return (
    <div className="flex items-center gap-2.5">
      <div className="h-2 w-24 overflow-hidden rounded-full bg-edge-soft">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="tabular text-xs text-muted">
        {usados.toLocaleString('es-DO')} / {total.toLocaleString('es-DO')}
        <span className="text-faint"> · {restantes.toLocaleString('es-DO')} rest.</span>
      </span>
    </div>
  )
}

// Fecha de vencimiento + "en N días" con color según urgencia.
function VenceCell({ fecha, dias }) {
  if (!fecha) return <span className="text-muted">—</span>
  const tone = dias == null ? 'text-muted' : dias <= 7 ? 'text-danger-strong' : dias <= 30 ? 'text-amber-strong' : 'text-muted'
  return (
    <div>
      <div className="text-muted">{date(fecha)}</div>
      {dias != null && (
        <div className={`text-xs ${tone}`}>
          {dias < 0 ? `hace ${Math.abs(dias)} día${Math.abs(dias) === 1 ? '' : 's'}` : `en ${dias} día${dias === 1 ? '' : 's'}`}
        </div>
      )}
    </div>
  )
}

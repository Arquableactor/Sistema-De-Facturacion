import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Topbar from '../components/layout/Topbar.jsx'
import Badge from '../components/ui/Badge.jsx'
import DataState from '../components/data/DataState.jsx'
import useApi from '../hooks/useApi.js'
import { money, date } from '../lib/format.js'
import { getProjects } from '../api/projectsApi.js'
import { getInvoices } from '../api/invoicesApi.js'
import { getWarranties } from '../api/warrantiesApi.js'
import { stageMeta } from './projects/projectMeta.jsx'
import { statusMeta } from './invoices/invoiceMeta.js'

// KPIs calculados en el front sobre las listas completas — válido al volumen actual.
// TODO: mover a un endpoint de resumen server-side cuando el volumen crezca.
const STAGE_ORDER = ['Visita', 'Diseno', 'Permisos', 'Montaje', 'Conexion', 'Finalizado']
const BAR_BG = {
  gray: 'bg-faint',
  blue: 'bg-primary',
  purple: 'bg-purple',
  amber: 'bg-amber',
  orange: 'bg-orange',
  green: 'bg-green',
}
const DAY = 86400000

export default function DashboardPage() {
  const p = useApi(() => getProjects(), [])
  const i = useApi(() => getInvoices(), [])
  const w = useApi(() => getWarranties(), [])

  const loading = p.loading || i.loading || w.loading
  const error = p.error || i.error || w.error
  const reloadAll = () => {
    p.reload()
    i.reload()
    w.reload()
  }

  const projects = p.data || []
  const invoices = i.data || []
  const warranties = w.data || []

  const kpis = useMemo(() => {
    const cuentasPorCobrar = invoices
      .filter((inv) => inv.status === 'Issued' || inv.status === 'PartiallyPaid')
      .reduce((s, inv) => s + Number(inv.balance || 0), 0)
    return {
      proyectosActivos: projects.length,
      cuentasPorCobrar,
      facturasVencidas: invoices.filter((inv) => inv.isOverdue).length,
      garantiasActivas: warranties.filter((wr) => wr.status === 'Active').length,
    }
  }, [projects, invoices, warranties])

  const porEtapa = useMemo(() => {
    const rows = STAGE_ORDER.map((s) => ({
      etapa: s,
      ...stageMeta(s),
      count: projects.filter((pr) => pr.etapa === s).length,
    }))
    const max = Math.max(1, ...rows.map((r) => r.count))
    return { rows, max }
  }, [projects])

  const recientes = useMemo(() => invoices.slice(0, 5), [invoices])

  const porVencer = useMemo(() => {
    const now = Date.now()
    return warranties
      .filter((wr) => wr.status === 'Active')
      .map((wr) => ({ ...wr, days: Math.ceil((new Date(wr.endDate).getTime() - now) / DAY) }))
      .filter((wr) => wr.days <= 90)
      .sort((a, b) => a.days - b.days)
  }, [warranties])

  return (
    <>
      <Topbar title="Panel general" subtitle="Resumen del negocio" />

      <div className="p-6">
        <DataState loading={loading} error={error} empty={false} onRetry={reloadAll}>
          <div className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatCard label="Proyectos activos" value={kpis.proyectosActivos} />
              <StatCard label="Cuentas por cobrar" value={money(kpis.cuentasPorCobrar)} />
              <StatCard
                label="Facturas vencidas"
                value={kpis.facturasVencidas}
                tone={kpis.facturasVencidas > 0 ? 'text-danger-strong' : undefined}
              />
              <StatCard label="Garantías activas" value={kpis.garantiasActivas} tone="text-green-strong" />
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Proyectos por etapa */}
              <Card title="Proyectos por etapa">
                <div className="space-y-2.5">
                  {porEtapa.rows.map((e) => (
                    <div key={e.etapa} className="flex items-center gap-3">
                      <div className="w-20 shrink-0 text-sm text-muted">{e.label}</div>
                      <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-edge-soft">
                        <div
                          className={`h-full rounded-full ${BAR_BG[e.tone] || 'bg-faint'}`}
                          style={{ width: `${(e.count / porEtapa.max) * 100}%` }}
                        />
                      </div>
                      <div className="w-6 shrink-0 text-right tabular text-sm text-brand-text">
                        {e.count}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Garantías por vencer */}
              <Card title="Garantías por vencer (90 días)">
                {porVencer.length === 0 ? (
                  <p className="text-sm text-muted">Ninguna garantía vence pronto.</p>
                ) : (
                  <ul className="divide-y divide-edge">
                    {porVencer.map((wr) => (
                      <li key={wr.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <div className="font-medium text-brand-text">{wr.warrantyNumber}</div>
                          <div className="truncate text-xs text-muted">{wr.projectNombre}</div>
                        </div>
                        <div className="shrink-0 text-right">
                          <div className="text-muted">{date(wr.endDate)}</div>
                          <div className="text-xs text-amber">en {wr.days} día{wr.days === 1 ? '' : 's'}</div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>

            {/* Facturas recientes */}
            <Card title="Facturas recientes">
              {recientes.length === 0 ? (
                <p className="text-sm text-muted">Aún no hay facturas.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-xs uppercase tracking-wide text-faint">
                      <tr>
                        <th className="py-2 pr-4 font-semibold">Nº</th>
                        <th className="py-2 pr-4 font-semibold">Cliente</th>
                        <th className="py-2 pr-4 text-right font-semibold">Total</th>
                        <th className="py-2 pr-4 font-semibold">Vence</th>
                        <th className="py-2 font-semibold">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recientes.map((inv) => {
                        const st = statusMeta(inv.status)
                        return (
                          <tr key={inv.id} className="border-t border-edge">
                            <td className="py-2.5 pr-4 font-medium">
                              <Link to={`/facturacion/${inv.id}`} className="text-primary hover:underline">
                                {inv.invoiceNumber}
                              </Link>
                            </td>
                            <td className="py-2.5 pr-4 text-muted">{inv.clientName}</td>
                            <td className="py-2.5 pr-4 text-right tabular text-brand-text">
                              {money(inv.total)}
                            </td>
                            <td className="py-2.5 pr-4">
                              <span className={inv.isOverdue ? 'font-semibold text-danger-strong' : 'text-muted'}>
                                {date(inv.dueDate)}
                                {inv.isOverdue && ' · Vencida'}
                              </span>
                            </td>
                            <td className="py-2.5">
                              <Badge tone={st.tone}>{st.label}</Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </div>
        </DataState>
      </div>
    </>
  )
}

function StatCard({ label, value, tone }) {
  return (
    <div className="rounded-card border border-edge bg-surface p-5 shadow-card">
      <div className="text-xs font-medium uppercase tracking-wide text-faint">{label}</div>
      <div className={`mt-2 font-display text-2xl font-semibold tabular ${tone || 'text-brand-text'}`}>
        {value}
      </div>
    </div>
  )
}

function Card({ title, children }) {
  return (
    <div className="rounded-card border border-edge bg-surface p-5 shadow-card">
      <h2 className="mb-4 font-display text-base font-semibold text-brand-text">{title}</h2>
      {children}
    </div>
  )
}

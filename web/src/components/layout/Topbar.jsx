// Barra superior de cada sección: título + subtítulo + hueco para acción primaria.
export default function Topbar({ title, subtitle, action }) {
  return (
    <header className="flex items-center justify-between gap-4 border-b border-edge bg-surface px-6 py-4">
      <div className="min-w-0">
        <h1 className="font-display text-lg font-semibold text-brand-text">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </header>
  )
}

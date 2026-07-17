// Tarjeta de las páginas públicas. Igual que las de la app pero con más aire y, si se
// le pasa `step`, el círculo numerado del diseño de captación.
// `tone="amber"` la tiñe para destacar un bloque (la factura de luz).
export default function PublicCard({ step, title, subtitle, action, tone, children, className = '' }) {
  const amber = tone === 'amber'
  const shell = amber
    ? 'border-amber/35 bg-amber-soft'
    : 'border-edge bg-surface shadow-card'

  return (
    <section className={`rounded-card border p-4 sm:p-5 ${shell} ${className}`}>
      {(title || step) && (
        <header className="mb-4 flex items-start gap-3">
          {step != null && (
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand font-display text-xs font-bold text-white">
              {step}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-semibold text-brand-text">{title}</h2>
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      {children}
    </section>
  )
}

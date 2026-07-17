import BrandMark from '../ui/BrandMark.jsx'

// Hero público de APE: el sol ámbar sobre navy, la marca y una promesa corta.
// ESTA es la pieza que la landing reusará tal cual — por eso el contenido entra por
// props y aquí solo vive el lenguaje visual (sol, tipografía, badge).
export default function PublicHero({ badge, title, subtitle, compact = false }) {
  return (
    <div
      className={`relative overflow-hidden rounded-card bg-brand-dark shadow-card ${
        compact ? 'p-5' : 'p-5 sm:p-7'
      }`}
    >
      {/* El sol: un resplandor radial ámbar, la firma visual de la marca.
          aria-hidden porque es decorativo y no aporta información. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-8 h-36 w-36 rounded-full bg-amber blur-2xl opacity-40"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-2 h-20 w-20 rounded-full bg-amber opacity-90"
      />

      <div className="relative">
        <div className="flex items-center gap-2.5">
          <BrandMark size={36} />
          <div className="min-w-0 leading-tight">
            <div className="font-display text-sm font-semibold text-white">APE Multiservicios</div>
            <div className="truncate text-[10px] font-semibold uppercase tracking-wide text-white/55">
              Soluciones eléctricas · Energía solar
            </div>
          </div>
        </div>

        {badge && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1.5 text-xs font-extrabold uppercase tracking-wide text-brand-dark">
            <CheckIcon />
            {badge}
          </span>
        )}

        {title && (
          <h1 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl">
            {title}
          </h1>
        )}
        {subtitle && <p className="mt-2 text-sm leading-relaxed text-white/70">{subtitle}</p>}
      </div>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

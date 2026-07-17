import { money } from '../../lib/format.js'

// El estimado de consumo, con el número grande como protagonista.
// Se rotula SIEMPRE como estimado: este formulario CAPTA, no dimensiona — el cálculo
// real lo hace APE en la visita técnica, y la UI no debe insinuar más precisión de la
// que tiene. El costo en RD$ sale de una tarifa promedio configurable, así que se
// presenta como acompañante, nunca como el dato principal.
export default function EstimateCard({ kwhDia, kwhMes, costoMensual, className = '' }) {
  return (
    <div className={`relative overflow-hidden rounded-card bg-brand-dark p-5 shadow-card ${className}`}>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-8 -top-10 h-32 w-32 rounded-full bg-amber opacity-25 blur-2xl"
      />
      <div className="relative">
        <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wide text-amber">
          <SunIcon />
          Tu consumo estimado
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-5xl font-bold leading-none tabular text-white">
            {kwhMes.toLocaleString('es-DO', { maximumFractionDigits: 0 })}
          </span>
          <span className="text-sm font-semibold text-white/70">kWh / mes</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold tabular text-white/80">
            {kwhDia.toLocaleString('es-DO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} kWh / día
          </span>
          {costoMensual != null && (
            <span className="rounded-full border border-amber/40 bg-amber/10 px-2.5 py-1 text-xs font-semibold text-amber">
              Costo eléctrico estimado {money(costoMensual)}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

function SunIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

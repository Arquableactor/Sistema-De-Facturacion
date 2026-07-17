import Stepper from '../../components/public/Stepper.jsx'

// Un equipo del catálogo. Cerrado es una casilla; al marcarlo se despliegan cantidad y
// horas. Los controles solo aparecen cuando hacen falta: si la lista mostrara 24
// equipos con sus steppers abiertos, el formulario sería imposible en un móvil.
export default function EquipoItem({ appliance, seleccion, accent, onToggle, onChange }) {
  const sel = !!seleccion

  return (
    <div
      className={`overflow-hidden rounded-card border transition-colors ${
        sel ? 'bg-surface' : 'border-edge bg-edge-soft/50'
      }`}
      style={sel ? { borderColor: accent } : undefined}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={sel}
        className="flex w-full items-center gap-3 p-3 text-left transition-colors hover:bg-edge-soft/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <span
          aria-hidden="true"
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg ${
            sel ? 'text-white' : 'border-2 border-edge text-faint'
          }`}
          style={sel ? { backgroundColor: accent } : undefined}
        >
          {sel ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          ) : (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          )}
        </span>

        <span className="min-w-0 flex-1">
          <span className="block text-sm font-bold leading-tight text-brand-text">
            {appliance.nombre}
          </span>
          <span className="mt-0.5 block text-xs font-semibold text-faint">
            ~{appliance.watts} W
          </span>
        </span>
      </button>

      {sel && (
        <div className="space-y-2.5 border-t border-edge px-3 pb-3 pt-2.5">
          <Stepper
            label="Cantidad"
            value={seleccion.cantidad}
            min={1}
            max={30}
            onChange={(v) => onChange({ ...seleccion, cantidad: v })}
            accent={accent}
          />
          <Stepper
            label="Horas al día"
            value={seleccion.horasPorDia}
            min={0.5}
            max={24}
            step={0.5}
            onChange={(v) => onChange({ ...seleccion, horasPorDia: v })}
            format={(v) => `${v} h`}
            accent={accent}
            valueWidth="min-w-[3rem]"
          />
        </div>
      )}
    </div>
  )
}

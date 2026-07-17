// Control −/+ táctil. Botones de 40px: el mínimo cómodo con el pulgar, que es como se
// va a usar (el link llega por WhatsApp). Reutilizable para cualquier cantidad.
//
// `format` permite mostrar el valor a la manera del dominio (ej. "8 h") sin que el
// componente sepa de unidades. `accent` lo tiñe con el color de su categoría.
export default function Stepper({
  label,
  value,
  min = 1,
  max = 99,
  step = 1,
  onChange,
  format = (v) => String(v),
  accent,
  valueWidth = 'min-w-[2.5rem]',
}) {
  // Los decimales de JS (0.1+0.2) arruinarían las horas: redondeamos al paso.
  const clamp = (v) => Math.min(max, Math.max(min, Math.round(v / step) * step))
  const bump = (d) => onChange(clamp(Number((value + d * step).toFixed(4))))

  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-xs font-bold text-muted">{label}</span>
      <div className="flex items-center gap-1 rounded-btn border border-edge bg-surface p-0.5">
        <StepButton
          onClick={() => bump(-1)}
          disabled={value <= min}
          accent={accent}
          label={`Menos ${label.toLowerCase()}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M5 12h14" />
          </svg>
        </StepButton>

        <span
          className={`${valueWidth} text-center font-display text-sm font-bold tabular text-brand-text`}
          aria-live="polite"
        >
          {format(value)}
        </span>

        <StepButton
          onClick={() => bump(1)}
          disabled={value >= max}
          accent={accent}
          label={`Más ${label.toLowerCase()}`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" aria-hidden="true">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </StepButton>
      </div>
    </div>
  )
}

function StepButton({ onClick, disabled, accent, label, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      style={accent ? { color: accent } : undefined}
      className="grid h-10 w-10 place-items-center rounded-lg bg-edge-soft transition-colors hover:bg-edge disabled:cursor-not-allowed disabled:opacity-40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {children}
    </button>
  )
}

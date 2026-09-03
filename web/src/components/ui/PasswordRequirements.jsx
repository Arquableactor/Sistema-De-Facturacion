import { PASSWORD_RULES } from '../../lib/passwordPolicy.js'

// Indicador EN VIVO de la fortaleza de la contraseña: barra simple + checklist de reglas
// que se marcan a medida que se escribe. Reutilizable en crear usuario y resetear.
// El backend es la autoridad; esto guía al usuario y evita el ida-y-vuelta con el 400.
export default function PasswordRequirements({ value = '' }) {
  const results = PASSWORD_RULES.map((r) => ({ ...r, ok: r.test(value) }))
  const passed = results.filter((r) => r.ok).length
  const total = results.length
  // Barra: gris si vacío; roja/ámbar/verde según cuántas reglas cumple.
  const barTone =
    value.length === 0 ? 'bg-edge' : passed <= 2 ? 'bg-danger' : passed < total ? 'bg-amber' : 'bg-green'
  const pct = value.length === 0 ? 0 : (passed / total) * 100

  return (
    <div className="mt-2">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-edge">
        <div
          className={`h-full rounded-full transition-all ${barTone}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <ul className="mt-2 space-y-1">
        {results.map((r) => (
          <li
            key={r.key}
            className={`flex items-center gap-2 text-xs transition-colors ${
              r.ok ? 'text-green-strong' : 'text-muted'
            }`}
          >
            <span aria-hidden="true" className="shrink-0">
              {r.ok ? <CheckIcon /> : <DotIcon />}
            </span>
            {r.label}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function DotIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="3" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

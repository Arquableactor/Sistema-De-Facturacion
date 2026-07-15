import { useTheme } from '../../theme/ThemeContext.jsx'

// Interruptor claro/oscuro. `variant="onBrand"` es para fondos de marca (sidebar navy),
// donde los tokens de texto no aplican y se usa blanco translúcido.
export default function ThemeToggle({ variant = 'default', compact = false, className = '' }) {
  const { isDark, toggleTheme } = useTheme()
  const label = isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'

  const styles =
    variant === 'onBrand'
      ? 'text-white/70 hover:bg-white/10 hover:text-white'
      : 'text-muted hover:bg-edge-soft hover:text-brand-text'

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={label}
      aria-label={label}
      aria-pressed={isDark}
      className={`inline-flex items-center gap-2 rounded-btn transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
        compact ? 'h-10 w-full justify-center' : 'px-2.5 py-2'
      } ${styles} ${className}`}
    >
      {isDark ? <SunIcon /> : <MoonIcon />}
      {!compact && <span className="text-sm font-medium">{isDark ? 'Claro' : 'Oscuro'}</span>}
    </button>
  )
}

const iconProps = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': 'true',
  focusable: 'false',
}

function MoonIcon() {
  return (
    <svg {...iconProps}>
      <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  )
}

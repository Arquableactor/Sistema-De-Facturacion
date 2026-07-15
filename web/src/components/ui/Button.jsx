// Los botones sólidos usan los tokens `*-solid`, no el acento: en tema oscuro el
// acento se aclara (para leerse sobre el fondo) y dejaría el texto blanco ilegible.
const VARIANTS = {
  primary: 'bg-primary-solid text-white hover:bg-primary-solid-hover shadow-sm',
  ghost: 'bg-transparent text-muted hover:bg-edge-soft',
  danger: 'bg-danger-solid text-white hover:bg-danger-solid-hover',
}

// El spinner sigue al color del texto de cada variante: en blanco fijo era invisible
// sobre el fondo claro de un botón ghost (que es el que más usa `loading`, ej. PDF).
const SPINNERS = {
  primary: 'border-white/40 border-t-white',
  danger: 'border-white/40 border-t-white',
  ghost: 'border-muted/40 border-t-muted',
}

export default function Button({
  children,
  variant = 'primary',
  type = 'button',
  loading = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${VARIANTS[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span
          className={`h-4 w-4 animate-spin rounded-full border-2 ${SPINNERS[variant] || SPINNERS.primary}`}
        />
      )}
      {children}
    </button>
  )
}

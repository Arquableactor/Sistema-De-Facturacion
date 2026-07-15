// Los botones sólidos usan los tokens `*-solid`, no el acento: en tema oscuro el
// acento se aclara (para leerse sobre el fondo) y dejaría el texto blanco ilegible.
const VARIANTS = {
  primary: 'bg-primary-solid text-white hover:bg-primary-solid-hover shadow-sm',
  ghost: 'bg-transparent text-muted hover:bg-edge-soft',
  danger: 'bg-danger-solid text-white hover:bg-danger-solid-hover',
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
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
    </button>
  )
}

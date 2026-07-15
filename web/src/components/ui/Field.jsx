// Campo de formulario reutilizable. Soporta un control nativo `input` o, si se pasan
// `children` (p. ej. un <select>), los usa como control. Muestra error por campo.
export default function Field({ label, id, type = 'text', error, children, ...props }) {
  const control = children ?? (
    <input
      id={id}
      type={type}
      className={`w-full rounded-btn border bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:ring-2 ${
        error
          ? 'border-danger focus:border-danger focus:ring-danger/15'
          : 'border-edge focus:border-primary focus:ring-primary/15'
      }`}
      {...props}
    />
  )

  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {control}
      {error && <span className="mt-1 block text-xs font-medium text-danger-strong">{error}</span>}
    </label>
  )
}

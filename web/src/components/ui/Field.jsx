export default function Field({ label, id, type = 'text', ...props }) {
  return (
    <label htmlFor={id} className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      <input
        id={id}
        type={type}
        className="w-full rounded-btn border border-edge bg-white px-3.5 py-2.5 text-sm text-brand-text outline-none transition-colors placeholder:text-faint focus:border-primary focus:ring-2 focus:ring-primary/15"
        {...props}
      />
    </label>
  )
}

// Badge de estado reutilizable. `tone` mapea a los colores soft del handoff.
const TONES = {
  green: 'bg-green-soft text-green-strong',
  gray: 'bg-edge-soft text-muted',
  amber: 'bg-amber-soft text-[#9A6510]',
  red: 'bg-danger-soft text-danger-strong',
  blue: 'bg-primary-soft text-primary',
  purple: 'bg-purple-soft text-purple',
}

export default function Badge({ tone = 'gray', children }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONES[tone] || TONES.gray}`}
    >
      {children}
    </span>
  )
}

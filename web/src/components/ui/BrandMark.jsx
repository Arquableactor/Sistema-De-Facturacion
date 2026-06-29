// Isotipo placeholder: sol ámbar sobre techo verde. // TODO: reemplazar por el logo real.
export default function BrandMark({ size = 36 }) {
  return (
    <div
      className="grid shrink-0 place-items-center rounded-[10px] bg-white/10"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <svg width={size * 0.62} height={size * 0.62} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="9" r="4" fill="#F5A623" />
        <path d="M3 20 L12 13 L21 20 Z" fill="#18A957" />
      </svg>
    </div>
  )
}

import { useEffect } from 'react'
import { createPortal } from 'react-dom'

// Modal genérico (la pieza plantilla). Overlay + panel centrado; cierra con Esc,
// click fuera, o el botón ✕. `footer` para las acciones. No cierra mientras `busy`.
const SIZES = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  busy = false,
}) {
  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape' && !busy) onClose?.()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, busy, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-brand/40 p-4"
      onMouseDown={() => !busy && onClose?.()}
    >
      <div
        role="dialog"
        aria-modal="true"
        className={`w-full ${SIZES[size] || SIZES.md} overflow-hidden rounded-card bg-surface shadow-card`}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-edge px-5 py-4">
          <h2 className="font-display text-base font-semibold text-brand-text">{title}</h2>
          <button
            onClick={() => !busy && onClose?.()}
            className="grid h-8 w-8 place-items-center rounded-md text-faint hover:bg-edge-soft hover:text-muted"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-edge bg-edge-soft/40 px-5 py-3">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}

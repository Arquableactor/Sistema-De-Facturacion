import { useEffect, useId, useRef, useState } from 'react'

// Menú de acciones "tres puntos" (kebab) reutilizable para las columnas de acciones.
// Se le pasan `items`: [{ label, onClick, tone?: 'default'|'danger', disabled? }].
// Sumar una opción futura es agregar un item; no hace falta tocar el componente.
// Accesible: abre con click/Enter/Espacio, navega con ↑/↓, cierra con Esc o click fuera
// y devuelve el foco al botón al cerrar.
export default function ActionMenu({ items = [], label = 'Acciones' }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const itemRefs = useRef([])
  const menuId = useId()

  const usable = items.filter(Boolean)

  // Cierra al hacer click fuera. Se registra solo mientras está abierto.
  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onPointerDown)
    return () => document.removeEventListener('mousedown', onPointerDown)
  }, [open])

  // Al abrir, enfoca la opción activa (para que ↑/↓ y Enter funcionen de una).
  useEffect(() => {
    if (open && activeIndex >= 0) itemRefs.current[activeIndex]?.focus()
  }, [open, activeIndex])

  function close({ refocus = true } = {}) {
    setOpen(false)
    setActiveIndex(-1)
    if (refocus) buttonRef.current?.focus()
  }

  function openAt(index) {
    setOpen(true)
    setActiveIndex(index)
  }

  function onButtonKeyDown(e) {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      openAt(0)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      openAt(usable.length - 1)
    }
  }

  function onItemKeyDown(e, index) {
    if (e.key === 'Escape') {
      e.preventDefault()
      close()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((index + 1) % usable.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((index - 1 + usable.length) % usable.length)
    } else if (e.key === 'Tab') {
      close({ refocus: false })
    }
  }

  function run(item) {
    if (item.disabled) return
    close()
    item.onClick?.()
  }

  if (usable.length === 0) return null

  return (
    <div ref={rootRef} className="relative inline-block text-left">
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        onClick={() => (open ? close({ refocus: false }) : openAt(-1))}
        onKeyDown={onButtonKeyDown}
        className="grid h-8 w-8 place-items-center rounded-md text-muted transition-colors hover:bg-edge-soft hover:text-brand-text focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <DotsIcon />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          aria-label={label}
          className="absolute right-0 z-30 mt-1 min-w-[11rem] overflow-hidden rounded-btn border border-edge bg-surface py-1 shadow-card"
        >
          {usable.map((item, i) => (
            <button
              key={item.label}
              ref={(el) => (itemRefs.current[i] = el)}
              role="menuitem"
              type="button"
              disabled={item.disabled}
              onClick={() => run(item)}
              onKeyDown={(e) => onItemKeyDown(e, i)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`block w-full px-3.5 py-2 text-left text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none ${
                item.tone === 'danger'
                  ? 'text-danger-strong hover:bg-danger-soft focus-visible:bg-danger-soft'
                  : 'text-brand-text hover:bg-edge-soft focus-visible:bg-edge-soft'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function DotsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  )
}

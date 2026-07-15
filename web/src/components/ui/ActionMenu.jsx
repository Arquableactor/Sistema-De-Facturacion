import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Menú de acciones "tres puntos" (kebab) reutilizable para las columnas de acciones.
// Se le pasan `items`: [{ label, onClick, tone?: 'default'|'danger', disabled? }].
// Sumar una opción futura es agregar un item; no hace falta tocar el componente.
// Accesible: abre con click/Enter/Espacio, navega con ↑/↓, cierra con Esc o click fuera
// y devuelve el foco al botón al cerrar.
export default function ActionMenu({ items = [], label = 'Acciones' }) {
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const [pos, setPos] = useState(null)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const menuRef = useRef(null)
  const itemRefs = useRef([])
  const menuId = useId()

  const usable = items.filter(Boolean)

  // El menú se pinta en un PORTAL con posición fija: dentro de la tabla lo recortaba el
  // `overflow-x-auto` del contenedor (las últimas filas quedaban con el menú cortado).
  // Se ancla al botón y se voltea hacia arriba si no cabe abajo.
  const place = useCallback(() => {
    const btn = buttonRef.current
    if (!btn) return
    const r = btn.getBoundingClientRect()
    const h = menuRef.current?.offsetHeight ?? 0
    const below = window.innerHeight - r.bottom
    const flip = h > 0 && below < h + 8 && r.top > below
    setPos({ top: flip ? r.top - h - 4 : r.bottom + 4, right: window.innerWidth - r.right })
  }, [])

  // Cierra al hacer click fuera o con Esc. Ambos listeners van a nivel de documento:
  // si Esc solo estuviera en los ítems, abrir con el mouse (sin foco en ninguno) dejaría
  // el menú imposible de cerrar con teclado. Se registran solo mientras está abierto.
  // Reposiciona al abrir y mientras esté abierto (scroll/resize): al ser `fixed`, no
  // sigue solo al botón.
  useLayoutEffect(() => {
    if (!open) return
    place()
  }, [open, place])

  useEffect(() => {
    if (!open) return
    const onMove = () => place()
    window.addEventListener('scroll', onMove, true) // true: también scroll de la tabla
    window.addEventListener('resize', onMove)
    return () => {
      window.removeEventListener('scroll', onMove, true)
      window.removeEventListener('resize', onMove)
    }
  }, [open, place])

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      const inRoot = rootRef.current?.contains(e.target)
      const inMenu = menuRef.current?.contains(e.target)
      if (!inRoot && !inMenu) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') {
        e.stopPropagation() // que no cierre además el modal que lo contenga
        setOpen(false)
        setActiveIndex(-1)
        buttonRef.current?.focus()
      }
    }
    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
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
    // Esc lo maneja el listener de documento (cubre también abrir con el mouse).
    if (e.key === 'ArrowDown') {
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

      {open &&
        createPortal(
        <div
          id={menuId}
          ref={menuRef}
          role="menu"
          aria-label={label}
          style={{ position: 'fixed', top: pos?.top ?? -9999, right: pos?.right ?? 0 }}
          className="z-50 min-w-[11rem] overflow-hidden rounded-btn border border-edge bg-surface py-1 shadow-card"
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
        </div>,
        document.body,
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

import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// Toasts reutilizables. Envuelve la app con <ToastProvider> y usa useToast().success/error.
const ToastContext = createContext(null)

const TONES = {
  success: 'border-green/30 bg-green-soft text-green-strong',
  error: 'border-danger/30 bg-danger-soft text-danger-strong',
  info: 'border-edge bg-surface text-brand-text',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const idRef = useRef(0)

  const remove = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id))
  }, [])

  const push = useCallback(
    (type, message) => {
      const id = ++idRef.current
      setToasts((list) => [...list, { id, type, message }])
      setTimeout(() => remove(id), 3200)
    },
    [remove],
  )

  const value = useMemo(
    () => ({
      success: (m) => push('success', m),
      error: (m) => push('error', m),
      info: (m) => push('info', m),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-80 flex-col gap-2">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={`pointer-events-auto rounded-btn border px-4 py-3 text-sm font-medium shadow-card ${TONES[t.type] || TONES.info}`}
              role="status"
            >
              {t.message}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>')
  return ctx
}

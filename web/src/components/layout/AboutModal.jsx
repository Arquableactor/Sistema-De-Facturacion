import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'
import BrandMark from '../ui/BrandMark.jsx'

// Aviso de LICENCIA / propiedad para el personal de APE. NO es un "acepta para continuar":
// los empleados NO aceptan términos para usar la herramienta — esto es solo un aviso de que
// el software es licenciado. Todo dato específico es PLACEHOLDER para reemplazar por el real.
const SISTEMA = '{{SISTEMA}}'
const VERSION = '{{VERSIÓN}}'
const ANIO = '{{AÑO}}'
const DESARROLLADOR = '{{DESARROLLADOR}}'

export default function AboutModal({ open, onClose }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Acerca de"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Cerrar
        </Button>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <BrandMark size={40} />
          <div>
            <div className="font-display text-base font-semibold text-brand-text">{SISTEMA}</div>
            <div className="text-xs text-muted">Versión {VERSION}</div>
          </div>
        </div>

        <p className="rounded-btn bg-edge-soft/60 px-3.5 py-3 text-sm leading-relaxed text-muted">
          {SISTEMA} es un producto licenciado. © {ANIO} {DESARROLLADOR}. Uso bajo licencia.
        </p>

        <p className="text-xs text-muted">
          Consulta los{' '}
          {/* /terminos es público; se abre en pestaña nueva para no salir de la app. */}
          <a
            href="/terminos"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary transition-colors hover:underline"
          >
            Términos y Condiciones
          </a>
          .
        </p>
      </div>
    </Modal>
  )
}

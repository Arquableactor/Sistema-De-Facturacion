import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { BarcodeFormat, DecodeHintType } from '@zxing/library'
import Modal from '../ui/Modal.jsx'
import Button from '../ui/Button.jsx'

// Escáner de código de barras REUTILIZABLE (hoy lo usa el catálogo; mañana lo puede usar
// otra pantalla). Lee el código con la cámara y lo devuelve por `onDetected(texto)`.
// Solo códigos de PRODUCTO — nada de seriales, facturación ni fotos.
//
// ── CONTEXTO SEGURO ──────────────────────────────────────────────────────────────────
// getUserMedia solo funciona en contexto seguro. En desarrollo por http://localhost va
// bien; EN PRODUCCIÓN EL SITIO DEBE SERVIRSE POR HTTPS o la cámara no abrirá.
//
// ── REGLA DE ORO: la cámara se apaga SIEMPRE ─────────────────────────────────────────
// El stream vive solo mientras el modal está abierto. Todo el manejo está en un único
// efecto keyeado por `open`, cuyo cleanup llama `apagarCamara()`. Ese cleanup corre en
// CADA salida: detección, botón cancelar, ✕, Esc, click-fuera, error y desmontaje —
// porque todas terminan poniendo `open=false` (o desmontando). `apagarCamara()` detiene
// el loop de ZXing y, como red de seguridad, corta a mano cada track del stream. Una
// cámara encendida de más es un bug de privacidad y de batería, así que se blinda por
// construcción, no por disciplina en cada handler.

// Los simbolismos típicos de código de PRODUCTO. Restringirlos acelera la lectura y evita
// falsos positivos con otros formatos.
const FORMATOS = [
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
]

function construirHints() {
  const hints = new Map()
  hints.set(DecodeHintType.POSSIBLE_FORMATS, FORMATOS)
  return hints
}

function mensajeError(err) {
  const name = err?.name || ''
  if (['NotAllowedError', 'PermissionDeniedError', 'SecurityError'].includes(name)) {
    return 'No se pudo acceder a la cámara — puedes escribir el código manualmente.'
  }
  if (['NotFoundError', 'DevicesNotFoundError', 'OverconstrainedError'].includes(name)) {
    return 'No se encontró una cámara en el dispositivo — escribe el código manualmente.'
  }
  return 'No se pudo iniciar la cámara — escribe el código manualmente.'
}

export default function BarcodeScannerModal({ open, onDetected, onClose }) {
  const videoRef = useRef(null)
  // `onDetected` por ref: así el efecto depende SOLO de `open` y no reinicia la cámara en
  // cada render del padre (que pasa un handler nuevo cada vez).
  const onDetectedRef = useRef(onDetected)
  useEffect(() => {
    onDetectedRef.current = onDetected
  }, [onDetected])

  const [estado, setEstado] = useState('iniciando') // iniciando | escaneando | detectado | error
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return

    let controls = null // IScannerControls de ZXing
    let stream = null // handle directo al MediaStream, para apagarlo aunque el ref ya sea null
    let detenido = false // idempotencia + guarda de carrera (cierre antes de resolver el permiso)
    let cierre = null // timer del feedback breve antes de cerrar
    const reader = new BrowserMultiFormatReader(construirHints())
    setEstado('iniciando')
    setError('')

    // Apaga TODO: detiene el loop de ZXing y corta cada track del stream (la red de
    // seguridad que garantiza que el LED de la cámara se apague pase lo que pase). No
    // depende de videoRef.current (que React puede haber puesto a null al desmontar):
    // guarda el stream aparte y también corta sus tracks.
    function apagarCamara() {
      detenido = true
      try {
        controls?.stop()
      } catch {
        /* noop */
      }
      controls = null
      for (const s of [stream, videoRef.current?.srcObject]) {
        if (s && typeof s.getTracks === 'function') s.getTracks().forEach((t) => t.stop())
      }
      stream = null
      if (videoRef.current) videoRef.current.srcObject = null
    }

    async function iniciar() {
      try {
        const c = await reader.decodeFromConstraints(
          // facingMode 'environment' = cámara trasera en móvil (con la que se escanea);
          // `ideal` para que en desktop caiga a la webcam por defecto sin fallar.
          { video: { facingMode: { ideal: 'environment' } } },
          videoRef.current,
          (result) => {
            if (!result || detenido) return
            apagarCamara() // 1) cámara OFF de inmediato
            setEstado('detectado') // 2) feedback breve
            const texto = result.getText()
            cierre = setTimeout(() => onDetectedRef.current?.(texto), 550) // 3) rellena + cierra
          },
        )
        if (detenido) {
          // Se cerró el modal mientras se pedía el permiso: apaga lo que ZXing haya abierto.
          try {
            c.stop()
          } catch {
            /* noop */
          }
          return
        }
        controls = c
        stream = videoRef.current?.srcObject || null // handle para apagar con certeza
        setEstado('escaneando')
      } catch (e) {
        apagarCamara()
        setEstado('error')
        setError(mensajeError(e))
      }
    }
    iniciar()

    return () => {
      if (cierre) clearTimeout(cierre)
      apagarCamara()
    }
  }, [open])

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title="Escanear código de barras"
      footer={
        <Button variant="ghost" onClick={onClose}>
          Cancelar
        </Button>
      }
    >
      <div className="space-y-3">
        {estado === 'error' ? (
          <div className="rounded-btn bg-danger-soft px-3 py-3 text-sm font-medium text-danger-strong">
            {error}
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-card bg-brand-dark">
            {/* aspect-[4/3] da un visor de forma estable en móvil y desktop */}
            <video
              ref={videoRef}
              className="aspect-[4/3] w-full bg-brand-dark object-cover"
              muted
              playsInline
            />
            {/* Guía visual de dónde apuntar: ventana clara con el resto oscurecido */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 grid place-items-center"
            >
              <div
                className={`h-28 w-4/5 rounded-lg border-2 shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] transition-colors ${
                  estado === 'detectado' ? 'border-green' : 'border-white/85'
                }`}
              />
            </div>
            {/* Estado sobre el video */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 text-center text-sm font-semibold text-white">
              {estado === 'iniciando' && 'Solicitando cámara…'}
              {estado === 'escaneando' && 'Apunta al código de barras'}
              {estado === 'detectado' && '✓ Código detectado'}
            </div>
          </div>
        )}
        <p className="text-xs text-muted">
          El código se rellena solo al detectarlo. También puedes escribirlo a mano.
        </p>
      </div>
    </Modal>
  )
}

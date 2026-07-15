import { useEffect, useState } from 'react'
import Modal from '../../components/ui/Modal.jsx'
import Button from '../../components/ui/Button.jsx'
import Field from '../../components/ui/Field.jsx'
import { generateWarranty } from '../../api/warrantiesApi.js'

// Genera la garantía del proyecto (cubre sus equipos instalados). Notas opcionales.
export default function GenerateWarrantyModal({ open, projectId, equiposCount, onClose, onGenerated }) {
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setNotes('')
    setFormError('')
  }, [open])

  async function onConfirm() {
    setSubmitting(true)
    setFormError('')
    try {
      const payload = { projectId }
      const n = notes.trim()
      if (n) payload.notes = n
      await generateWarranty(payload)
      onGenerated()
    } catch (err) {
      // 409 = sin equipos / ya tiene garantía (el message incluye el GAR-# existente).
      setFormError(err.message || 'No se pudo generar la garantía.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      busy={submitting}
      title="Generar garantía"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} loading={submitting}>
            Generar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {formError && (
          <div className="rounded-btn bg-danger-soft px-3 py-2.5 text-sm text-danger-strong">
            {formError}
          </div>
        )}
        <p className="text-sm text-muted">
          Se generará el certificado de garantía cubriendo los{' '}
          <span className="font-semibold text-brand-text">{equiposCount}</span> equipo
          {equiposCount === 1 ? '' : 's'} instalado{equiposCount === 1 ? '' : 's'} de este proyecto.
        </p>
        <Field id="warrantyNotes" label="Notas (opcional)">
          <textarea
            id="warrantyNotes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-btn border border-edge bg-surface px-3.5 py-2.5 text-sm text-brand-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            placeholder="Condiciones particulares, observaciones…"
          />
        </Field>
      </div>
    </Modal>
  )
}

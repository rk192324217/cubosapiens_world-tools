"use client"

import { useEffect, useState } from "react"
import { createPortal } from "react-dom"

interface Props {
  open: boolean
  onClose: () => void
}

export default function AIUnavailableModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  if (!open || !mounted) return null

  const modal = (
    <div className="ai-modal-backdrop" onClick={onClose}>
      <div className="ai-modal-card" onClick={e => e.stopPropagation()}>
        <button className="ai-modal-close" onClick={onClose}>×</button>
        <div className="ai-modal-icon">🤖</div>
        <h1 className="ai-modal-title">Coming Soon</h1>
        <p className="ai-modal-desc">AI Tools Under Development. Stay Tuned!</p>
        <div className="ai-modal-actions">
          <button className="ai-modal-btn-close" onClick={onClose}>OK</button>
        </div>
      </div>
    </div>
  )

  return createPortal(modal, document.body)
}

"use client"

import { useState } from "react"
import { StripeCheckoutButton } from "@/components/shared/stripe-buttons"

interface PlanGateProps {
  message: string
  onClose?: () => void
}

export function PlanGateModal({ message, onClose }: PlanGateProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-[--radius-lg] border border-border p-8 max-w-sm w-full shadow-lg">
        <div className="text-3xl mb-4 text-center">🚀</div>
        <h2 className="text-lg font-semibold text-foreground text-center mb-2">
          Límite alcanzado
        </h2>
        <p className="text-sm text-muted text-center mb-6">{message}</p>
        <StripeCheckoutButton />
        {onClose && (
          <button
            onClick={onClose}
            className="mt-3 w-full text-sm text-muted hover:text-foreground transition-colors cursor-pointer"
          >
            No por ahora
          </button>
        )}
      </div>
    </div>
  )
}

export function usePlanGate() {
  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")

  function show(msg: string) {
    setMessage(msg)
    setOpen(true)
  }

  function hide() {
    setOpen(false)
  }

  return { open, message, show, hide }
}

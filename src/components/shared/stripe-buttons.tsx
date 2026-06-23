"use client"

import { useState } from "react"

interface StripeButtonProps {
  className?: string
  accentColor?: string
}

export function StripeCheckoutButton({ className = "", accentColor }: StripeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? "Error al iniciar el pago")
        setLoading(false)
      }
    } catch {
      alert("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-[--radius-sm] px-4 py-2.5 text-sm font-medium text-white transition-colors cursor-pointer disabled:opacity-50 ${className}`}
      style={{ background: accentColor ?? "var(--primary)" }}
    >
      {loading ? "Redirigiendo..." : "Mejorar a Pro"}
    </button>
  )
}

export function StripePortalButton({ className = "", accentColor }: StripeButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" })
      const data = await res.json() as { url?: string; error?: string }
      if (data.url) {
        window.location.href = data.url
      } else {
        alert(data.error ?? "Error al abrir el portal")
        setLoading(false)
      }
    } catch {
      alert("Error de conexión")
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`w-full rounded-[--radius-sm] border border-border px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50 hover:bg-surface ${className}`}
      style={{ color: accentColor ?? "var(--foreground)" }}
    >
      {loading ? "Redirigiendo..." : "Gestionar suscripción"}
    </button>
  )
}

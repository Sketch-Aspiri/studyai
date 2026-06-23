"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface ToggleExamStatusProps {
  examId: string
  isActive: boolean
}

export function ToggleExamStatus({ examId, isActive }: ToggleExamStatusProps) {
  const [active, setActive] = useState(isActive)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function toggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/teacher/exams/${examId}/results`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !active }),
      })
      if (res.ok) {
        setActive((v) => !v)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="rounded-[--radius-sm] border border-border px-4 py-2 text-sm font-medium transition-colors cursor-pointer disabled:opacity-50"
      style={
        active
          ? { borderColor: "var(--teacher)", color: "var(--teacher)" }
          : { borderColor: "var(--border)", color: "var(--muted)" }
      }
    >
      {loading ? "..." : active ? "Desactivar examen" : "Activar examen"}
    </button>
  )
}

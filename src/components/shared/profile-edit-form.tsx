"use client"

import { useState } from "react"

interface ProfileEditFormProps {
  initialName: string
  accentColor?: string
}

export function ProfileEditForm({ initialName, accentColor = "var(--primary)" }: ProfileEditFormProps) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [editing, setEditing] = useState(false)

  async function handleSave() {
    if (!name.trim()) return
    setStatus("saving")
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      })
      if (!res.ok) throw new Error()
      setStatus("saved")
      setEditing(false)
      setTimeout(() => setStatus("idle"), 2000)
    } catch {
      setStatus("error")
    }
  }

  function handleCancel() {
    setName(initialName)
    setEditing(false)
    setStatus("idle")
  }

  if (!editing) {
    return (
      <div className="flex items-center justify-between">
        <p className="text-sm text-foreground">{name || "—"}</p>
        <button
          onClick={() => setEditing(true)}
          className="text-xs font-medium transition-colors hover:opacity-80"
          style={{ color: accentColor }}
        >
          Editar
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="w-full rounded-[--radius-sm] border border-border px-3 py-1.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
        placeholder="Tu nombre"
        maxLength={200}
        autoFocus
      />
      <div className="flex items-center gap-2">
        <button
          onClick={handleSave}
          disabled={status === "saving" || !name.trim()}
          className="rounded-[--radius-sm] px-3 py-1.5 text-xs font-medium text-white transition-colors disabled:opacity-50"
          style={{ background: accentColor }}
        >
          {status === "saving" ? "Guardando…" : "Guardar"}
        </button>
        <button
          onClick={handleCancel}
          className="rounded-[--radius-sm] border border-border px-3 py-1.5 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          Cancelar
        </button>
        {status === "saved" && (
          <span className="text-xs text-success">Guardado</span>
        )}
        {status === "error" && (
          <span className="text-xs text-destructive">Error al guardar</span>
        )}
      </div>
    </div>
  )
}

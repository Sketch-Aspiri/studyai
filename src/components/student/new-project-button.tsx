"use client"

import { useState } from "react"
import { ProjectFormDialog } from "./project-form-dialog"

interface NewProjectButtonProps {
  accentColor?: string
}

export function NewProjectButton({ accentColor }: NewProjectButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-[--radius-sm] px-4 py-2.5 text-sm font-medium text-white transition-colors"
        style={{ background: accentColor ?? "var(--primary)" }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nuevo proyecto
      </button>
      <ProjectFormDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}

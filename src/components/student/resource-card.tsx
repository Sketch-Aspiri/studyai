"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { SummaryViewer } from "./summary-viewer"

interface Resource {
  id: string
  type: string
  title: string
  content: unknown
  created_at: Date
}

const TYPE_META: Record<string, { icon: string; label: string }> = {
  SUMMARY: { icon: "📝", label: "Resumen" },
  CONCEPT_MAP: { icon: "🗺️", label: "Mapa Conceptual" },
  EXAM: { icon: "📋", label: "Examen" },
  FLASHCARDS: { icon: "🃏", label: "Flashcards" },
}

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const meta = TYPE_META[resource.type] ?? { icon: "✨", label: resource.type }

  const summaryText =
    resource.type === "SUMMARY"
      ? (resource.content as { text?: string })?.text ?? ""
      : ""

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/resources/${resource.id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-[--radius-md] border border-border overflow-hidden">
      {/* Card header */}
      <div className="flex items-center gap-3 p-4">
        <span className="text-2xl flex-shrink-0">{meta.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted">{meta.label}</p>
          <p className="text-sm font-semibold text-foreground truncate">{resource.title}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="rounded-[--radius-sm] px-2.5 py-1.5 text-xs font-medium text-primary hover:bg-primary/5 transition-colors"
          >
            {expanded ? "Cerrar" : "Ver"}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="rounded-[--radius-sm] p-1.5 text-muted hover:text-destructive hover:bg-red-50 transition-colors"
              aria-label="Eliminar recurso"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-muted hover:text-foreground px-2 py-1"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="text-xs font-medium text-destructive hover:bg-red-50 px-2 py-1 rounded transition-colors"
              >
                {isPending ? "..." : "Sí"}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Expanded viewer */}
      {expanded && summaryText && (
        <div className="border-t border-border px-5 py-4 max-h-[600px] overflow-y-auto">
          <SummaryViewer content={summaryText} />
        </div>
      )}
    </div>
  )
}

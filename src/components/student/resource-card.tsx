"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { SummaryViewer } from "./summary-viewer"
import { ConceptMapViewer, type ConceptMapData } from "./concept-map-viewer"
import { ExamPlayer, type ExamData } from "./exam-player"
import { FlashcardDeck, type FlashcardsData } from "./flashcard-deck"

interface Resource {
  id: string
  type: string
  title: string
  content: unknown
  created_at: Date
}

const TYPE_META: Record<string, { icon: React.ReactNode; label: string }> = {
  SUMMARY: {
    label: "Resumen",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  CONCEPT_MAP: {
    label: "Mapa Conceptual",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  EXAM: {
    label: "Examen",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  FLASHCARDS: {
    label: "Flashcards",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
}

interface ResourceCardProps {
  resource: Resource
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const meta = TYPE_META[resource.type] ?? {
    label: resource.type,
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  }

  const summaryText =
    resource.type === "SUMMARY" ? (resource.content as { text?: string })?.text ?? "" : ""
  const conceptMapData =
    resource.type === "CONCEPT_MAP" ? (resource.content as ConceptMapData) : null
  const examData =
    resource.type === "EXAM" ? (resource.content as ExamData) : null
  const flashcardsData =
    resource.type === "FLASHCARDS" ? (resource.content as FlashcardsData) : null

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/resources/${resource.id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  return (
    <div className="bg-white rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <span className="flex-shrink-0 h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-muted">
          {meta.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-muted">{meta.label}</p>
          <p className="text-sm font-semibold text-foreground truncate">{resource.title}</p>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => setExpanded((v) => !v)}
            className="min-h-[40px] rounded-lg px-3 text-xs font-medium text-primary hover:bg-primary/5 transition-colors cursor-pointer"
          >
            {expanded ? "Cerrar" : "Ver"}
          </button>
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-muted hover:text-destructive hover:bg-red-50 transition-colors cursor-pointer"
              aria-label="Eliminar recurso"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setConfirmDelete(false)}
                className="min-h-[40px] px-2 text-xs text-muted hover:text-foreground cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="min-h-[40px] px-2 text-xs font-medium text-destructive hover:bg-red-50 rounded transition-colors cursor-pointer"
              >
                {isPending ? "..." : "Sí"}
              </button>
            </div>
          )}
        </div>
      </div>

      {expanded && summaryText && (
        <div className="border-t border-border px-5 py-4 max-h-[600px] overflow-y-auto overscroll-contain">
          <SummaryViewer content={summaryText} />
        </div>
      )}
      {expanded && conceptMapData && (
        <div className="border-t border-border p-4">
          <ConceptMapViewer content={conceptMapData} />
        </div>
      )}
      {expanded && examData && (
        <div className="border-t border-border px-5 py-4 max-h-[700px] overflow-y-auto overscroll-contain">
          <ExamPlayer content={examData} />
        </div>
      )}
      {expanded && flashcardsData && (
        <div className="border-t border-border px-4 py-4 max-h-[700px] overflow-y-auto overscroll-contain">
          <FlashcardDeck content={flashcardsData} />
        </div>
      )}
    </div>
  )
}

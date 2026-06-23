"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { SummaryViewer } from "@/components/student/summary-viewer"
import { ConceptMapViewer, type ConceptMapData } from "@/components/student/concept-map-viewer"
import { ExamPlayer, type ExamData } from "@/components/student/exam-player"
import { FlashcardDeck, type FlashcardsData } from "@/components/student/flashcard-deck"
import { PublishExamDialog } from "./publish-exam-dialog"

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

interface TeacherResourceCardProps {
  resource: Resource
}

export function TeacherResourceCard({ resource }: TeacherResourceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
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

  const rawContent = resource.content
  const summaryText =
    resource.type === "SUMMARY"
      ? typeof rawContent === "string"
        ? rawContent
        : (rawContent as { text?: string })?.text ?? ""
      : ""
  const conceptMapData =
    resource.type === "CONCEPT_MAP" ? (rawContent as ConceptMapData) : null
  const examData =
    resource.type === "EXAM" ? (rawContent as ExamData) : null
  const flashcardsData =
    resource.type === "FLASHCARDS" ? (rawContent as FlashcardsData) : null

  const canPrint = resource.type !== "CONCEPT_MAP"

  function handleDelete() {
    startTransition(async () => {
      await fetch(`/api/resources/${resource.id}`, { method: "DELETE" })
      router.refresh()
    })
  }

  function handlePrint() {
    document.body.classList.add("printing-resource")
    window.print()
    document.body.classList.remove("printing-resource")
  }

  return (
    <>
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
            {/* Publish button — only for EXAM type */}
            {resource.type === "EXAM" && (
              <button
                onClick={() => setPublishOpen(true)}
                className="min-h-[40px] rounded-lg px-3 text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                style={{ color: "var(--teacher)" }}
                title="Publicar examen para estudiantes"
              >
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Publicar
              </button>
            )}
            <button
              onClick={() => setFullscreen(true)}
              className="min-h-[40px] min-w-[40px] flex items-center justify-center rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              aria-label="Pantalla completa"
              title="Pantalla completa"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
              </svg>
            </button>
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

      {fullscreen && (
        <div className="resource-print-overlay fixed inset-0 z-50 flex flex-col bg-white">
          {/* Header */}
          <div className="no-print flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="h-8 w-8 rounded-lg bg-surface flex items-center justify-center text-muted flex-shrink-0">
                {meta.icon}
              </span>
              <div>
                <p className="text-xs text-muted">{meta.label}</p>
                <p className="text-sm font-semibold text-foreground">{resource.title}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {canPrint ? (
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 min-h-[36px] px-3 rounded-lg text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                  title="Guardar como PDF usando el diálogo de impresión"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Descargar PDF
                </button>
              ) : (
                <span className="flex items-center gap-1.5 min-h-[36px] px-3 text-sm text-muted/50 select-none" title="El mapa conceptual no es compatible con impresión">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  PDF no disponible
                </span>
              )}
              <button
                onClick={() => setFullscreen(false)}
                className="flex items-center justify-center h-9 w-9 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
                aria-label="Cerrar pantalla completa"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {summaryText && (
              <div className="max-w-3xl mx-auto px-6 py-8">
                <SummaryViewer content={summaryText} />
              </div>
            )}
            {conceptMapData && (
              <div className="p-4" style={{ height: "calc(100vh - 73px)" }}>
                <ConceptMapViewer content={conceptMapData} />
              </div>
            )}
            {examData && (
              <div className="max-w-3xl mx-auto px-6 py-8">
                <ExamPlayer content={examData} />
              </div>
            )}
            {flashcardsData && (
              <div className="max-w-3xl mx-auto px-6 py-8">
                <FlashcardDeck content={flashcardsData} />
              </div>
            )}
          </div>
        </div>
      )}

      {publishOpen && (
        <PublishExamDialog
          resourceId={resource.id}
          resourceTitle={resource.title}
          onClose={() => setPublishOpen(false)}
        />
      )}
    </>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useGenerationStream } from "@/hooks/useGenerationStream"
import { SummaryViewer } from "./summary-viewer"

interface Document {
  id: string
  filename: string
  processing_status: string
}

interface GenerationPanelProps {
  projectId: string
  documents: Document[]
  accentColor?: string
}

const RESOURCE_TYPES = [
  {
    id: "SUMMARY",
    label: "Resumen",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    id: "CONCEPT_MAP",
    label: "Mapa",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
      </svg>
    ),
  },
  {
    id: "EXAM",
    label: "Examen",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  {
    id: "FLASHCARDS",
    label: "Flashcards",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
] as const

type ResourceTypeId = (typeof RESOURCE_TYPES)[number]["id"]

export function GenerationPanel({ projectId, documents, accentColor = "var(--primary)" }: GenerationPanelProps) {
  const [selectedType, setSelectedType] = useState<ResourceTypeId>("SUMMARY")
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const { state, startStream, cancel, reset } = useGenerationStream()
  const router = useRouter()

  const completedDocs = documents.filter((d) => d.processing_status === "COMPLETED")
  const selectedTypeLabel = RESOURCE_TYPES.find((t) => t.id === selectedType)?.label ?? "recurso"

  useEffect(() => {
    if (selectedDocIds.length === 0) { setTitle(""); return }
    const firstName = documents.find((d) => d.id === selectedDocIds[0])?.filename.replace(/\.[^.]+$/, "") ?? ""
    setTitle(`${selectedTypeLabel} — ${firstName}`)
  }, [selectedType, selectedDocIds, documents, selectedTypeLabel])

  useEffect(() => {
    if (state.resourceId && !state.isStreaming) {
      router.refresh()
    }
  }, [state.resourceId, state.isStreaming, router])

  function toggleDoc(id: string) {
    setSelectedDocIds((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    )
  }

  function handleGenerate() {
    if (selectedDocIds.length === 0 || !title.trim() || state.isStreaming) return
    startStream(projectId, selectedType, selectedDocIds, title.trim())
  }

  const canGenerate = selectedDocIds.length > 0 && title.trim().length > 0 && !state.isStreaming

  if (state.isStreaming || state.content || state.resourceId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {state.isStreaming && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: accentColor }} />
              </span>
            )}
            <span className="text-sm font-medium text-foreground">
              {state.isStreaming
                ? `Generando ${selectedTypeLabel}...`
                : state.resourceId
                ? `${selectedTypeLabel} generado`
                : ""}
            </span>
          </div>
          <div className="flex gap-2">
            {state.isStreaming && (
              <button
                onClick={cancel}
                className="min-h-[36px] px-3 text-xs text-muted hover:text-foreground transition-colors cursor-pointer"
              >
                Cancelar
              </button>
            )}
            {!state.isStreaming && (
              <button
                onClick={reset}
                className="min-h-[36px] px-3 text-xs font-medium hover:opacity-80 transition-opacity cursor-pointer"
                style={{ color: accentColor }}
              >
                + Generar otro
              </button>
            )}
          </div>
        </div>

        {state.error && (
          <div className="rounded-lg bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.content && selectedType === "SUMMARY" && (
          <div className="rounded-lg border border-border bg-white px-5 py-4 max-h-[500px] overflow-y-auto overscroll-contain">
            <SummaryViewer content={state.content} />
            {state.isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5" />
            )}
          </div>
        )}
        {state.isStreaming && selectedType !== "SUMMARY" && (
          <div className="rounded-lg border border-border bg-surface px-5 py-8 flex flex-col items-center gap-3 text-center">
            <div
              className="h-8 w-8 rounded-full border-2 animate-spin"
              style={{ borderColor: accentColor, borderTopColor: "transparent" }}
            />
            <p className="text-sm text-muted">Construyendo {selectedTypeLabel}...</p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Resource type tabs — horizontal scroll on mobile */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Tipo de recurso</p>
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x">
          {RESOURCE_TYPES.map((t) => {
            const isSelected = selectedType === t.id
            return (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className="flex-shrink-0 snap-start flex items-center gap-1.5 rounded-lg px-3 min-h-[40px] text-sm font-medium transition-colors border cursor-pointer"
                style={
                  isSelected
                    ? { background: accentColor, borderColor: accentColor, color: "#fff" }
                    : { borderColor: "var(--border)", color: "var(--muted)" }
                }
              >
                {t.icon}
                {t.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Document selector */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Documentos
          {completedDocs.length === 0 && (
            <span className="normal-case font-normal"> — sube y espera a que estén listos</span>
          )}
        </p>
        {completedDocs.length === 0 ? (
          <p className="text-sm text-muted italic">No hay documentos procesados aún.</p>
        ) : (
          <div className="space-y-1">
            {completedDocs.map((doc) => (
              <label
                key={doc.id}
                className="flex items-center gap-3 cursor-pointer min-h-[40px] rounded-lg px-2 hover:bg-surface transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selectedDocIds.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                  className="h-4 w-4 rounded border-border flex-shrink-0"
                  style={{ accentColor }}
                />
                <span className="text-sm text-foreground truncate">{doc.filename}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label htmlFor="resource-title" className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Título del recurso
        </label>
        <input
          id="resource-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Ej: Resumen de Biología Celular"
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
          style={{ ["--tw-ring-color" as string]: accentColor } as React.CSSProperties}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center gap-2 rounded-lg px-4 min-h-[44px] text-sm font-medium text-white transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:opacity-90"
        style={{ background: accentColor }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generar {selectedTypeLabel}
      </button>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}

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
  { id: "SUMMARY", label: "Resumen", icon: "📝" },
  { id: "CONCEPT_MAP", label: "Mapa Conceptual", icon: "🗺️" },
  { id: "EXAM", label: "Examen", icon: "📋" },
  { id: "FLASHCARDS", label: "Flashcards", icon: "🃏" },
] as const

type ResourceTypeId = (typeof RESOURCE_TYPES)[number]["id"]

export function GenerationPanel({ projectId, documents, accentColor = "var(--primary)" }: GenerationPanelProps) {
  const [selectedType, setSelectedType] = useState<ResourceTypeId>("SUMMARY")
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([])
  const [title, setTitle] = useState("")
  const { state, startStream, cancel, reset } = useGenerationStream()
  const router = useRouter()

  const completedDocs = documents.filter((d) => d.processing_status === "COMPLETED")

  // Auto-generate title when type or docs change
  useEffect(() => {
    if (selectedDocIds.length === 0) { setTitle(""); return }
    const firstName = documents.find((d) => d.id === selectedDocIds[0])?.filename.replace(/\.[^.]+$/, "") ?? ""
    const typeLabel = RESOURCE_TYPES.find((t) => t.id === selectedType)?.label ?? ""
    setTitle(`${typeLabel} — ${firstName}`)
  }, [selectedType, selectedDocIds, documents])

  // When done streaming, refresh the page to show the new resource in the list
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
              <span className="flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full opacity-75" style={{ background: accentColor }} />
                <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: accentColor }} />
              </span>
            )}
            <span className="text-sm font-medium text-foreground">
              {state.isStreaming
                ? `Generando ${RESOURCE_TYPES.find((t) => t.id === selectedType)?.label ?? "recurso"}...`
                : state.resourceId
                ? `${RESOURCE_TYPES.find((t) => t.id === selectedType)?.label ?? "Recurso"} generado`
                : ""}
            </span>
          </div>
          <div className="flex gap-2">
            {state.isStreaming && (
              <button onClick={cancel} className="text-xs text-muted hover:text-foreground transition-colors">
                Cancelar
              </button>
            )}
            {!state.isStreaming && (
              <button
                onClick={reset}
                className="text-xs font-medium hover:opacity-80 transition-opacity"
                style={{ color: accentColor }}
              >
                + Generar otro
              </button>
            )}
          </div>
        </div>

        {state.error && (
          <div className="rounded-[--radius-md] bg-destructive/5 border border-destructive/20 px-4 py-3 text-sm text-destructive">
            {state.error}
          </div>
        )}

        {state.content && selectedType === "SUMMARY" && (
          <div className="rounded-[--radius-md] border border-border bg-white px-5 py-4 max-h-[500px] overflow-y-auto">
            <SummaryViewer content={state.content} />
            {state.isStreaming && (
              <span className="inline-block w-0.5 h-4 bg-foreground animate-pulse ml-0.5" />
            )}
          </div>
        )}
        {state.isStreaming && selectedType !== "SUMMARY" && (
          <div className="rounded-[--radius-md] border border-border bg-surface px-5 py-8 flex flex-col items-center gap-3 text-center">
            <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: accentColor, borderTopColor: "transparent" }} />
            <p className="text-sm text-muted">
              Construyendo {RESOURCE_TYPES.find((t) => t.id === selectedType)?.label}...
            </p>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Resource type tabs */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">Tipo de recurso</p>
        <div className="flex gap-2 flex-wrap">
          {RESOURCE_TYPES.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`flex items-center gap-1.5 rounded-[--radius-sm] px-3 py-2 text-sm font-medium transition-colors border ${
                selectedType === t.id
                  ? "border-transparent text-white"
                  : "border-border text-muted hover:border-gray-300 hover:text-foreground"
              }`}
              style={selectedType === t.id ? { background: accentColor } : undefined}
            >
              <span>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Document selector */}
      <div>
        <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Documentos {completedDocs.length === 0 && <span className="normal-case font-normal">— sube y espera a que estén listos</span>}
        </p>
        {completedDocs.length === 0 ? (
          <p className="text-sm text-muted italic">No hay documentos procesados aún.</p>
        ) : (
          <div className="space-y-1.5">
            {completedDocs.map((doc) => (
              <label key={doc.id} className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectedDocIds.includes(doc.id)}
                  onChange={() => toggleDoc(doc.id)}
                  className="h-4 w-4 rounded border-border"
                  style={{ accentColor }}
                />
                <span className="text-sm text-foreground group-hover:text-foreground truncate">
                  {doc.filename}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-muted uppercase tracking-wide mb-2">
          Título del recurso
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={150}
          placeholder="Ej: Resumen de Biología Celular"
          className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
          style={{ ["--tw-ring-color" as string]: accentColor } as React.CSSProperties}
        />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={!canGenerate}
        className="w-full flex items-center justify-center gap-2 rounded-[--radius-sm] px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        style={{ background: accentColor }}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        Generar {RESOURCE_TYPES.find((t) => t.id === selectedType)?.label}
      </button>

      {state.error && (
        <p className="text-sm text-destructive">{state.error}</p>
      )}
    </div>
  )
}

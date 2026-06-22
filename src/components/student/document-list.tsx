"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"

interface Document {
  id: string
  filename: string
  file_type: string
  file_size: number
  processing_status: string
  created_at: Date
}

interface DocumentListProps {
  documents: Document[]
  accentColor?: string
}

const FILE_TYPE_ICONS: Record<string, string> = {
  PDF: "📄",
  DOCX: "📝",
  PPTX: "📊",
  TXT: "📃",
}

const STATUS_LABELS: Record<string, { label: string; classes: string }> = {
  PENDING: { label: "Pendiente", classes: "bg-warning/10 text-warning" },
  PROCESSING: { label: "Procesando", classes: "bg-blue-50 text-blue-600" },
  COMPLETED: { label: "Listo", classes: "bg-success/10 text-success" },
  FAILED: { label: "Error", classes: "bg-destructive/10 text-destructive" },
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function DocumentList({ documents, accentColor }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete(documentId: string) {
    setDeletingId(documentId)
    startTransition(async () => {
      await fetch(`/api/documents/${documentId}`, { method: "DELETE" })
      setDeletingId(null)
      setConfirmId(null)
      router.refresh()
    })
  }

  if (documents.length === 0) {
    return (
      <p className="text-sm text-muted text-center py-6">
        Aún no hay documentos. Sube tu primer archivo.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border">
      {documents.map((doc) => {
        const status = STATUS_LABELS[doc.processing_status] ?? STATUS_LABELS.PENDING
        const isDeleting = deletingId === doc.id
        const isConfirming = confirmId === doc.id

        return (
          <li key={doc.id} className="flex items-center gap-3 py-3 group">
            <span className="text-xl flex-shrink-0">{FILE_TYPE_ICONS[doc.file_type] ?? "📄"}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{doc.filename}</p>
              <p className="text-xs text-muted">
                {formatSize(doc.file_size)} ·{" "}
                {new Date(doc.created_at).toLocaleDateString("es", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
            </div>

            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${status.classes}`}>
              {status.label}
            </span>

            <div className="flex-shrink-0">
              {isConfirming ? (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-muted hover:text-foreground px-2 py-1"
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={isPending}
                    className="text-xs text-destructive font-medium px-2 py-1 hover:bg-red-50 rounded transition-colors"
                  >
                    {isDeleting ? "..." : "Sí, eliminar"}
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setConfirmId(doc.id)}
                  className="h-7 w-7 flex items-center justify-center rounded-[--radius-sm] text-muted opacity-0 group-hover:opacity-100 hover:bg-surface hover:text-destructive transition-all"
                  aria-label="Eliminar documento"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

"use client"

import { useRef, useState } from "react"
import { useRouter } from "next/navigation"

interface DocumentUploaderProps {
  projectId: string
  accentColor?: string
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
]
const MAX_SIZE_MB = 10

interface UploadState {
  filename: string
  progress: number
  analyzing: boolean
  error: string | null
}

export function DocumentUploader({ projectId, accentColor = "var(--primary)" }: DocumentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploading, setUploading] = useState<UploadState | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  function validateFile(file: File): string | null {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return "Tipo no soportado. Sube un PDF, DOCX, PPTX o TXT."
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return `El archivo supera los ${MAX_SIZE_MB} MB.`
    }
    return null
  }

  function uploadFile(file: File) {
    const validationError = validateFile(file)
    if (validationError) {
      setUploading({ filename: file.name, progress: 0, analyzing: false, error: validationError })
      return
    }

    setUploading({ filename: file.name, progress: 0, analyzing: false, error: null })

    const formData = new FormData()
    formData.append("file", file)

    const xhr = new XMLHttpRequest()

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 100)
        setUploading((prev) =>
          prev ? { ...prev, progress: pct, analyzing: pct === 100 } : null
        )
      }
    })

    xhr.addEventListener("load", () => {
      if (xhr.status === 201) {
        setUploading(null)
        router.refresh()
      } else {
        const body = JSON.parse(xhr.responseText) as { error?: string }
        setUploading((prev) =>
          prev ? { ...prev, error: body.error ?? "Error al subir el archivo." } : null
        )
      }
    })

    xhr.addEventListener("error", () => {
      setUploading((prev) =>
        prev ? { ...prev, error: "Error de conexión. Intenta de nuevo." } : null
      )
    })

    xhr.open("POST", `/api/projects/${projectId}/documents`)
    xhr.send(formData)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) uploadFile(file)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) uploadFile(file)
    e.target.value = ""
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center gap-2 rounded-[--radius-md] border-2 border-dashed p-8 text-center transition-colors cursor-pointer ${
          isDragging
            ? "border-current bg-current/5"
            : "border-border hover:border-gray-300 hover:bg-surface"
        }`}
        style={isDragging ? { borderColor: accentColor, background: `color-mix(in srgb, ${accentColor} 5%, transparent)` } : undefined}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.pptx,.txt"
          onChange={handleChange}
          className="sr-only"
          aria-label="Seleccionar archivo"
        />
        <svg
          className="h-8 w-8 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
          />
        </svg>
        <div>
          <p className="text-sm font-medium text-foreground">
            Arrastra un archivo aquí o{" "}
            <span style={{ color: accentColor }}>haz clic para seleccionar</span>
          </p>
          <p className="text-xs text-muted mt-0.5">PDF, DOCX, PPTX, TXT — máx. {MAX_SIZE_MB} MB</p>
        </div>
      </div>

      {uploading && (
        <div className="rounded-[--radius-md] border border-border bg-white p-4 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-sm text-foreground truncate">{uploading.filename}</span>
            {!uploading.error && (
              <span className="text-xs text-muted flex-shrink-0">
                {uploading.analyzing ? "Analizando..." : `${uploading.progress}%`}
              </span>
            )}
          </div>
          {uploading.error ? (
            <div className="flex items-center justify-between">
              <p className="text-xs text-destructive">{uploading.error}</p>
              <button
                onClick={() => setUploading(null)}
                className="text-xs text-muted hover:text-foreground ml-2"
              >
                Cerrar
              </button>
            </div>
          ) : (
            <>
              <div className="w-full bg-surface rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${uploading.analyzing ? "animate-pulse" : ""}`}
                  style={{ width: `${uploading.progress}%`, background: accentColor }}
                />
              </div>
              {uploading.analyzing && (
                <p className="text-xs text-muted">
                  Extrayendo texto con IA, esto puede tomar unos segundos...
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

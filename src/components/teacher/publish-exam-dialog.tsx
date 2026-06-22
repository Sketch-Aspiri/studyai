"use client"

import { useState } from "react"

interface PublishExamDialogProps {
  resourceId: string
  resourceTitle: string
  onClose: () => void
}

interface PublishResult {
  share_code: string
  share_url: string
}

export function PublishExamDialog({ resourceId, resourceTitle, onClose }: PublishExamDialogProps) {
  const [title, setTitle] = useState(resourceTitle)
  const [instructions, setInstructions] = useState("")
  const [timeLimitEnabled, setTimeLimitEnabled] = useState(false)
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(30)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<PublishResult | null>(null)
  const [copied, setCopied] = useState(false)

  async function handlePublish() {
    if (!title.trim()) return
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/shared-exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resource_id: resourceId,
          title: title.trim(),
          instructions: instructions.trim() || undefined,
          time_limit_minutes: timeLimitEnabled ? timeLimitMinutes : undefined,
        }),
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const errData = data as { error?: string }
        setError(errData.error ?? "Error al publicar el examen")
        return
      }
      setResult(data as PublishResult)
    } catch {
      setError("Error de conexión. Intenta de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  function handleCopy() {
    if (!result) return
    navigator.clipboard.writeText(result.share_url).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={!result ? onClose : undefined} />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">
            {result ? "Examen publicado" : "Publicar examen"}
          </h2>
          <button
            onClick={onClose}
            className="flex items-center justify-center h-8 w-8 rounded-lg text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Success state */}
        {result ? (
          <div className="px-6 py-5 space-y-5">
            <div className="flex flex-col items-center text-center gap-3 py-2">
              <div className="h-12 w-12 rounded-full bg-success/10 flex items-center justify-center">
                <svg className="h-6 w-6 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-sm text-muted">Tu examen está listo. Comparte este enlace con tus estudiantes.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg bg-surface border border-border p-3 text-center">
                <p className="text-xs text-muted mb-1">Código del examen</p>
                <p className="text-xl font-mono font-bold tracking-widest text-foreground">{result.share_code}</p>
              </div>

              <div className="flex gap-2">
                <input
                  readOnly
                  value={result.share_url}
                  className="flex-1 min-w-0 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground"
                />
                <button
                  onClick={handleCopy}
                  className="flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 cursor-pointer"
                  style={{ background: "var(--teacher)" }}
                >
                  {copied ? (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copiado
                    </>
                  ) : (
                    <>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copiar
                    </>
                  )}
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full min-h-[40px] rounded-lg border border-border text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        ) : (
          /* Form state */
          <div className="px-6 py-5 space-y-4">
            {/* Title */}
            <div>
              <label htmlFor="exam-title" className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                Título que verán los estudiantes
              </label>
              <input
                id="exam-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={200}
                placeholder="Ej: Examen de Biología — Unidad 1"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                style={{ ["--tw-ring-color" as string]: "var(--teacher)" } as React.CSSProperties}
              />
            </div>

            {/* Instructions */}
            <div>
              <label htmlFor="exam-instructions" className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                Instrucciones <span className="normal-case font-normal">(opcional)</span>
              </label>
              <textarea
                id="exam-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                maxLength={1000}
                rows={3}
                placeholder="Lee cada pregunta con cuidado..."
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:border-transparent transition-colors resize-none"
                style={{ ["--tw-ring-color" as string]: "var(--teacher)" } as React.CSSProperties}
              />
            </div>

            {/* Time limit */}
            <div>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={timeLimitEnabled}
                  onChange={(e) => setTimeLimitEnabled(e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                  style={{ accentColor: "var(--teacher)" }}
                />
                <span className="text-sm text-foreground">Límite de tiempo</span>
              </label>
              {timeLimitEnabled && (
                <div className="mt-2 flex items-center gap-2">
                  <input
                    type="number"
                    value={timeLimitMinutes}
                    onChange={(e) => setTimeLimitMinutes(Math.max(1, Math.min(180, Number(e.target.value))))}
                    min={1}
                    max={180}
                    className="w-20 rounded-lg border border-border px-3 py-2 text-sm text-foreground text-center focus:outline-none focus:ring-2 focus:border-transparent transition-colors"
                    style={{ ["--tw-ring-color" as string]: "var(--teacher)" } as React.CSSProperties}
                  />
                  <span className="text-sm text-muted">minutos</span>
                </div>
              )}
            </div>

            {error && (
              <p className="text-sm text-destructive bg-destructive/5 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="flex gap-2 pt-1">
              <button
                onClick={onClose}
                className="flex-1 min-h-[40px] rounded-lg border border-border text-sm text-muted hover:text-foreground hover:bg-surface transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handlePublish}
                disabled={isLoading || !title.trim()}
                className="flex-1 min-h-[40px] rounded-lg text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                style={{ background: "var(--teacher)" }}
              >
                {isLoading ? "Publicando..." : "Publicar examen"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

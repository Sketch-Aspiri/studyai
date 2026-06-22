"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { createProject, updateProject } from "@/app/actions/projects"

const EMOJIS = [
  "📁", "📚", "📖", "📝", "🔬", "🧮", "📐", "🌍",
  "💻", "🎨", "📊", "🧠", "⚗️", "🏛️", "🎭", "🌱",
]

interface ProjectFormDialogProps {
  open: boolean
  onClose: () => void
  initialData?: {
    id: string
    name: string
    emoji: string | null
    description: string | null
  }
}

export function ProjectFormDialog({ open, onClose, initialData }: ProjectFormDialogProps) {
  const isEdit = !!initialData
  const [emoji, setEmoji] = useState(initialData?.emoji ?? "📁")
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const nameRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setEmoji(initialData?.emoji ?? "📁")
      setError(null)
      setTimeout(() => nameRef.current?.focus(), 50)
    }
  }, [open, initialData])

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    formData.set("emoji", emoji)

    startTransition(async () => {
      const result = isEdit ? await updateProject(formData) : await createProject(formData)
      if (result?.error) {
        setError(result.error)
        return
      }
      router.refresh()
      onClose()
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="relative bg-white rounded-[--radius-lg] shadow-xl w-full max-w-md"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border">
          <h2 id="dialog-title" className="text-base font-semibold text-foreground">
            {isEdit ? "Editar proyecto" : "Nuevo proyecto"}
          </h2>
          <button
            onClick={onClose}
            className="text-muted hover:text-foreground transition-colors"
            aria-label="Cerrar"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {isEdit && <input type="hidden" name="id" value={initialData.id} />}

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              Emoji
            </label>
            <div className="grid grid-cols-8 gap-1.5">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => setEmoji(e)}
                  className={`h-9 w-9 flex items-center justify-center rounded-[--radius-sm] text-lg transition-colors ${
                    emoji === e
                      ? "bg-primary/10 ring-2 ring-primary"
                      : "hover:bg-surface"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="project-name" className="block text-sm font-medium text-foreground mb-1.5">
              Nombre <span className="text-destructive">*</span>
            </label>
            <input
              ref={nameRef}
              id="project-name"
              name="name"
              type="text"
              required
              maxLength={100}
              defaultValue={initialData?.name ?? ""}
              placeholder="Ej: Biología Molecular"
              className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
          </div>

          <div>
            <label htmlFor="project-description" className="block text-sm font-medium text-foreground mb-1.5">
              Descripción <span className="text-muted font-normal">(opcional)</span>
            </label>
            <textarea
              id="project-description"
              name="description"
              rows={2}
              maxLength={300}
              defaultValue={initialData?.description ?? ""}
              placeholder="Breve descripción del proyecto..."
              className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors resize-none"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="rounded-[--radius-sm] px-4 py-2 text-sm font-medium text-muted hover:text-foreground hover:bg-surface transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="rounded-[--radius-sm] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors disabled:opacity-60"
            >
              {isPending ? "Guardando..." : isEdit ? "Guardar cambios" : "Crear proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

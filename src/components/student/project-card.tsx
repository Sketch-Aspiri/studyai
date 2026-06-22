"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { deleteProject } from "@/app/actions/projects"
import { ProjectFormDialog } from "./project-form-dialog"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    emoji: string | null
    description: string | null
    created_at: Date
    _count: { documents: number; resources: number }
  }
  basePath: string
  accentColor?: string
}

export function ProjectCard({ project, basePath, accentColor = "var(--primary)" }: ProjectCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleDelete() {
    startTransition(async () => {
      await deleteProject(project.id)
      router.refresh()
    })
  }

  return (
    <>
      <div className="group relative bg-white rounded-[--radius-md] border border-border hover:border-gray-300 hover:shadow-sm transition-all">
        <Link href={`${basePath}/${project.id}`} className="block p-5">
          <div className="flex items-start justify-between gap-2">
            <span className="text-3xl leading-none">{project.emoji ?? "📁"}</span>
            <span className="text-xs text-muted mt-1">
              {new Date(project.created_at).toLocaleDateString("es", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
          <h3 className="mt-3 font-semibold text-foreground text-sm leading-snug line-clamp-2">
            {project.name}
          </h3>
          {project.description && (
            <p className="mt-1 text-xs text-muted line-clamp-2">{project.description}</p>
          )}
          <div className="mt-4 flex items-center gap-3">
            <span className="flex items-center gap-1 text-xs text-muted">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              {project._count.documents} doc{project._count.documents !== 1 ? "s" : ""}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {project._count.resources} recurso{project._count.resources !== 1 ? "s" : ""}
            </span>
          </div>
        </Link>

        {/* Menu button */}
        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault()
                setMenuOpen((v) => !v)
              }}
              className="h-7 w-7 flex items-center justify-center rounded-[--radius-sm] text-muted hover:bg-surface hover:text-foreground transition-colors"
              aria-label="Opciones del proyecto"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="5" cy="12" r="2" />
                <circle cx="12" cy="12" r="2" />
                <circle cx="19" cy="12" r="2" />
              </svg>
            </button>

            {menuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setMenuOpen(false)}
                />
                <div className="absolute right-0 top-8 z-20 bg-white rounded-[--radius-md] border border-border shadow-md py-1 min-w-36">
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      setEditOpen(true)
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-surface transition-colors"
                  >
                    <svg className="h-4 w-4 text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  {!confirmDelete ? (
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        setConfirmDelete(true)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-red-50 transition-colors"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Eliminar
                    </button>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Inline delete confirmation */}
        {confirmDelete && (
          <div className="absolute inset-0 bg-white rounded-[--radius-md] flex flex-col items-center justify-center gap-3 p-4 z-10">
            <p className="text-sm font-medium text-foreground text-center">
              ¿Eliminar <span className="font-semibold">{project.name}</span>?
            </p>
            <p className="text-xs text-muted text-center">
              Se eliminarán todos sus documentos y recursos.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(false)}
                className="rounded-[--radius-sm] px-3 py-1.5 text-sm text-muted hover:bg-surface transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-[--radius-sm] bg-destructive px-3 py-1.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {isPending ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        )}
      </div>

      <ProjectFormDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        initialData={{
          id: project.id,
          name: project.name,
          emoji: project.emoji,
          description: project.description,
        }}
      />
    </>
  )
}

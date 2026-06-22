import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DocumentUploader } from "@/components/student/document-uploader"
import { DocumentList } from "@/components/student/document-list"
import { GenerationPanel } from "@/components/student/generation-panel"
import { ResourceCard } from "@/components/student/resource-card"

type Props = { params: Promise<{ projectId: string }> }

export default async function StudentProjectPage({ params }: Props) {
  const { projectId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user!.id, deleted_at: null },
    include: {
      documents: { orderBy: { created_at: "desc" } },
      resources: { orderBy: { created_at: "desc" } },
    },
  })

  if (!project) notFound()

  return (
    <div className="p-4 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4 cursor-pointer"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Mis proyectos
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-3xl md:text-4xl leading-none">{project.emoji ?? "📁"}</span>
          <div>
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-muted mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents section */}
      <section className="bg-white rounded-lg border border-border p-4 md:p-6 mb-4 md:mb-6">
        <h2 className="text-base font-semibold text-foreground mb-4 md:mb-5">
          Documentos
          {project.documents.length > 0 && (
            <span className="ml-2 text-sm font-normal text-muted">({project.documents.length})</span>
          )}
        </h2>
        <DocumentUploader projectId={project.id} />
        {project.documents.length > 0 && (
          <div className="mt-4">
            <DocumentList documents={project.documents} />
          </div>
        )}
      </section>

      {/* Generation + Resources — stack on mobile, side-by-side on large */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-4 md:gap-6 items-start">
        <section className="bg-white rounded-lg border border-border p-4 md:p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 md:mb-5">Generar con IA</h2>
          {project.documents.length === 0 ? (
            <p className="text-sm text-muted">
              Sube al menos un documento para poder generar recursos con IA.
            </p>
          ) : (
            <GenerationPanel projectId={project.id} documents={project.documents} />
          )}
        </section>

        <section className="bg-white rounded-lg border border-border p-4 md:p-6">
          <h2 className="text-base font-semibold text-foreground mb-4 md:mb-5">
            Recursos generados
            {project.resources.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted">({project.resources.length})</span>
            )}
          </h2>
          {project.resources.length === 0 ? (
            <p className="text-sm text-muted italic">Aún no hay recursos generados para este proyecto.</p>
          ) : (
            <div className="space-y-3">
              {project.resources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

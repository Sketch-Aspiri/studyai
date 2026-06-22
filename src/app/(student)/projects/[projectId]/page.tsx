import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import Link from "next/link"
import { DocumentUploader } from "@/components/student/document-uploader"
import { DocumentList } from "@/components/student/document-list"

type Props = { params: Promise<{ projectId: string }> }

export default async function StudentProjectPage({ params }: Props) {
  const { projectId } = await params

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user!.id, deleted_at: null },
    include: {
      documents: { orderBy: { created_at: "desc" } },
      resources: { orderBy: { created_at: "desc" } },
    },
  })

  if (!project) notFound()

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors mb-4"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
          Mis proyectos
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{project.emoji ?? "📁"}</span>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{project.name}</h1>
            {project.description && (
              <p className="text-muted mt-0.5">{project.description}</p>
            )}
          </div>
        </div>
      </div>

      {/* Documents section */}
      <section className="bg-white rounded-[--radius-md] border border-border p-6 mb-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-foreground">
            Documentos
            {project.documents.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted">
                ({project.documents.length})
              </span>
            )}
          </h2>
        </div>

        <DocumentUploader projectId={project.id} />

        {project.documents.length > 0 && (
          <div className="mt-4">
            <DocumentList documents={project.documents} />
          </div>
        )}
      </section>

      {/* Resources placeholder — implemented in Steps 8–11 */}
      <section className="bg-white rounded-[--radius-md] border border-border p-6">
        <h2 className="text-base font-semibold text-foreground mb-4">Recursos de estudio</h2>
        {project.documents.length === 0 ? (
          <p className="text-sm text-muted">
            Sube al menos un documento para poder generar recursos con IA.
          </p>
        ) : (
          <p className="text-sm text-muted">
            La generación de recursos con IA estará disponible próximamente.
          </p>
        )}
      </section>
    </div>
  )
}

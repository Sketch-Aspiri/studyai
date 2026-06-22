import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { ProjectCard } from "@/components/student/project-card"
import { NewProjectButton } from "@/components/student/new-project-button"

const statsIcons = {
  projects: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  ),
  documents: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
  resources: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  plan: (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
}

export default async function StudentDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const name =
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    "Estudiante"

  const [projects, totalResources] = await Promise.all([
    db.project.findMany({
      where: { user_id: user!.id, deleted_at: null },
      include: { _count: { select: { documents: true, resources: true } } },
      orderBy: { updated_at: "desc" },
    }),
    db.resource.count({ where: { user_id: user!.id } }),
  ])

  const totalDocuments = projects.reduce((sum, p) => sum + p._count.documents, 0)

  const stats = [
    { label: "Proyectos", value: projects.length, icon: statsIcons.projects, key: "projects" },
    { label: "Documentos", value: totalDocuments, icon: statsIcons.documents, key: "documents" },
    { label: "Recursos generados", value: totalResources, icon: statsIcons.resources, key: "resources" },
    { label: "Plan", value: "Gratis", icon: statsIcons.plan, key: "plan" },
  ]

  return (
    <div className="p-4 md:p-8">
      <div className="flex items-start justify-between gap-3 mb-6 md:mb-8">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-foreground">
            Hola, {(name as string).split(" ")[0]}
          </h1>
          <p className="text-sm text-muted mt-1">
            {projects.length === 0
              ? "Crea tu primer proyecto para empezar."
              : `${projects.length} proyecto${projects.length !== 1 ? "s" : ""} activo${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NewProjectButton />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8 md:mb-10">
        {stats.map((stat) => (
          <div
            key={stat.key}
            className="bg-white rounded-lg border border-border p-4 md:p-5"
          >
            <div className="flex items-center gap-2 text-muted mb-2">
              {stat.icon}
              <span className="text-xs font-medium">{stat.label}</span>
            </div>
            <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-lg border border-border p-8 md:p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
          </div>
          <h2 className="text-base md:text-lg font-semibold text-foreground mb-2">
            Crea tu primer proyecto
          </h2>
          <p className="text-sm text-muted mb-6">
            Organiza tus documentos en proyectos y genera recursos de estudio con IA.
          </p>
          <NewProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              basePath="/projects"
            />
          ))}
        </div>
      )}
    </div>
  )
}

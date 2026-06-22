import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { ProjectCard } from "@/components/student/project-card"
import { NewProjectButton } from "@/components/student/new-project-button"

export default async function StudentDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            Hola, {(name as string).split(" ")[0]} 👋
          </h1>
          <p className="text-muted mt-1">
            {projects.length === 0
              ? "Crea tu primer proyecto para empezar."
              : `${projects.length} proyecto${projects.length !== 1 ? "s" : ""} activo${projects.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <NewProjectButton />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Proyectos", value: projects.length, icon: "📁" },
          { label: "Documentos", value: totalDocuments, icon: "📄" },
          { label: "Recursos generados", value: totalResources, icon: "✨" },
          { label: "Plan", value: "Gratis", icon: "⭐" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-[--radius-md] border border-border p-5"
          >
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-semibold text-foreground">{stat.value}</div>
            <div className="text-sm text-muted">{stat.label}</div>
          </div>
        ))}
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-[--radius-md] border border-border p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">📁</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Crea tu primer proyecto
          </h2>
          <p className="text-sm text-muted mb-6">
            Organiza tus documentos en proyectos y genera recursos de estudio con IA.
          </p>
          <NewProjectButton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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

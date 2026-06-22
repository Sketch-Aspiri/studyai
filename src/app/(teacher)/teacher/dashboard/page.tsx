import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { ProjectCard } from "@/components/student/project-card"
import { NewProjectButton } from "@/components/student/new-project-button"

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name =
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    "Maestro"

  const [projects, sharedExamsCount] = await Promise.all([
    db.project.findMany({
      where: { user_id: user!.id, deleted_at: null },
      include: { _count: { select: { documents: true, resources: true } } },
      orderBy: { updated_at: "desc" },
    }),
    db.sharedExam.count({ where: { teacher_id: user!.id } }),
  ])

  const totalAttempts = await db.examAttempt.count({
    where: { shared_exam: { teacher_id: user!.id } },
  })

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
        <NewProjectButton accentColor="var(--teacher)" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Proyectos", value: projects.length, icon: "📁" },
          { label: "Exámenes publicados", value: sharedExamsCount, icon: "📋" },
          { label: "Total intentos", value: totalAttempts, icon: "✏️" },
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
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Crea tu primer proyecto
          </h2>
          <p className="text-sm text-muted mb-6">
            Sube un documento, genera un examen con IA y comparte el enlace con tus alumnos.
          </p>
          <NewProjectButton accentColor="var(--teacher)" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              basePath="/teacher/projects"
              accentColor="var(--teacher)"
            />
          ))}
        </div>
      )}
    </div>
  )
}

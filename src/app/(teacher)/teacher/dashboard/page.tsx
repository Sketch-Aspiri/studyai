import { createClient } from "@/lib/supabase/server"

export default async function TeacherDashboard() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const name =
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    "Maestro"

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">
          Hola, {name.split(" ")[0]} 👋
        </h1>
        <p className="text-muted mt-1">
          Crea exámenes desde tus documentos y compártelos con tus alumnos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Exámenes creados", value: "0", icon: "📋" },
          { label: "Exámenes activos", value: "0", icon: "🔗" },
          { label: "Total intentos", value: "0", icon: "✏️" },
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

      <div className="bg-white rounded-[--radius-md] border border-border p-8 flex flex-col items-center justify-center text-center max-w-md mx-auto">
        <div className="text-5xl mb-4">📋</div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Crea tu primer examen
        </h2>
        <p className="text-sm text-muted mb-6">
          Sube un documento, genera un examen con IA y comparte el enlace con tus alumnos.
        </p>
        <a
          href="/teacher/exams"
          className="inline-flex items-center gap-2 rounded-[--radius-sm] px-4 py-2.5 text-sm font-medium text-white transition-colors"
          style={{ background: "var(--teacher)" }}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo examen
        </a>
      </div>
    </div>
  )
}

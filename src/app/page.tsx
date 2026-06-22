import Link from "next/link"

const features = [
  {
    emoji: "📝",
    title: "Resúmenes",
    description:
      "Obtén resúmenes claros y estructurados de tus documentos en segundos.",
  },
  {
    emoji: "🗺️",
    title: "Mapas conceptuales",
    description:
      "Visualiza las relaciones entre ideas con mapas generados automáticamente.",
  },
  {
    emoji: "📋",
    title: "Exámenes",
    description:
      "Genera exámenes de práctica o compártelos con tus alumnos mediante un enlace.",
  },
  {
    emoji: "🃏",
    title: "Flashcards",
    description:
      "Memoriza conceptos clave con tarjetas de estudio interactivas.",
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <span className="text-lg font-bold text-primary">StudyAI</span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              href="/signup"
              className="rounded-[--radius-sm] bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Empieza gratis
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary mb-6">
            ✨ Powered by Claude AI
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight mb-5">
            Transforma tus documentos en{" "}
            <span className="text-primary">recursos de estudio</span>
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto mb-8">
            Sube PDFs, presentaciones o textos y genera resúmenes, mapas
            conceptuales, exámenes y flashcards con inteligencia artificial.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/signup"
              className="rounded-[--radius-sm] bg-primary px-6 py-3 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
            >
              Empieza gratis — sin tarjeta
            </Link>
            <Link
              href="/login"
              className="rounded-[--radius-sm] border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-surface transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </section>

        <section className="bg-surface py-20">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-semibold text-center text-foreground mb-12">
              Todo lo que necesitas para estudiar mejor
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-[--radius-md] border border-border p-6"
                >
                  <div className="text-3xl mb-3">{feature.emoji}</div>
                  <h3 className="font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-20">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-[--radius-lg] border-2 border-primary/20 bg-primary/5 p-8">
              <div className="text-3xl mb-3">🎓</div>
              <h3 className="text-xl font-semibold text-primary mb-2">Estudiantes</h3>
              <p className="text-sm text-muted mb-4">
                Sube tus apuntes y genera recursos personalizados para estudiar más eficientemente.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Comenzar como estudiante →
              </Link>
            </div>
            <div className="rounded-[--radius-lg] border-2 border-[--teacher]/20 bg-[--teacher]/5 p-8">
              <div className="text-3xl mb-3">🏫</div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: "var(--teacher)" }}>
                Maestros
              </h3>
              <p className="text-sm text-muted mb-4">
                Crea exámenes desde tus materiales y compártelos con tus alumnos con un simple enlace.
              </p>
              <Link
                href="/signup"
                className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline"
                style={{ color: "var(--teacher)" }}
              >
                Comenzar como maestro →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} StudyAI. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  )
}

import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Precios — StudyAI",
  description: "Planes gratuitos y Pro para estudiantes y maestros. Empieza sin tarjeta.",
}

const studentFeatures = {
  free: ["2 proyectos", "3 documentos por proyecto", "15 generaciones al mes", "Todos los tipos de recurso"],
  pro: ["Proyectos ilimitados", "Documentos ilimitados", "200 generaciones al mes", "Todos los tipos de recurso"],
}

const teacherFeatures = {
  free: ["2 proyectos", "3 documentos por proyecto", "15 generaciones al mes", "Publicar hasta 3 exámenes activos"],
  pro: ["Proyectos ilimitados", "Documentos ilimitados", "200 generaciones al mes", "Exámenes ilimitados", "Analíticas avanzadas"],
}

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary">StudyAI</Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
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

      <main className="flex-1 mx-auto max-w-5xl px-6 py-16 w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">Precios simples y transparentes</h1>
          <p className="text-lg text-muted">Empieza gratis. Mejora cuando lo necesites.</p>
        </div>

        <section className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🎓</span>
            <h2 className="text-xl font-semibold text-foreground">Para Estudiantes</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[--radius-md] border border-border p-6">
              <div className="text-sm font-medium text-muted mb-1">Gratuito</div>
              <div className="text-3xl font-bold text-foreground mb-1">$0</div>
              <p className="text-sm text-muted mb-6">Para siempre</p>
              <ul className="space-y-2.5 text-sm text-muted mb-6">
                {studentFeatures.free.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-success">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-[--radius-sm] border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>

            <div className="bg-white rounded-[--radius-md] border-2 border-primary p-6 relative">
              <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                Popular
              </div>
              <div className="text-sm font-medium text-muted mb-1">Pro</div>
              <div className="text-3xl font-bold text-foreground mb-1">
                $9.99<span className="text-base font-normal text-muted">/mes</span>
              </div>
              <p className="text-sm text-muted mb-6">Cancela cuando quieras</p>
              <ul className="space-y-2.5 text-sm text-muted mb-6">
                {studentFeatures.pro.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-success">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-[--radius-sm] bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors"
              >
                Comenzar Pro
              </Link>
            </div>
          </div>
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🏫</span>
            <h2 className="text-xl font-semibold text-foreground">Para Maestros</h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-[--radius-md] border border-border p-6">
              <div className="text-sm font-medium text-muted mb-1">Gratuito</div>
              <div className="text-3xl font-bold text-foreground mb-1">$0</div>
              <p className="text-sm text-muted mb-6">Para siempre</p>
              <ul className="space-y-2.5 text-sm text-muted mb-6">
                {teacherFeatures.free.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-success">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-[--radius-sm] border border-border px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>

            <div
              className="bg-white rounded-[--radius-md] border-2 p-6 relative"
              style={{ borderColor: "var(--teacher)" }}
            >
              <div
                className="absolute -top-3 left-4 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--teacher)" }}
              >
                Popular
              </div>
              <div className="text-sm font-medium text-muted mb-1">Pro Maestro</div>
              <div className="text-3xl font-bold text-foreground mb-1">
                $12.99<span className="text-base font-normal text-muted">/mes</span>
              </div>
              <p className="text-sm text-muted mb-6">Cancela cuando quieras</p>
              <ul className="space-y-2.5 text-sm text-muted mb-6">
                {teacherFeatures.pro.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span style={{ color: "var(--teacher)" }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/signup"
                className="block text-center rounded-[--radius-sm] px-4 py-2.5 text-sm font-medium text-white transition-colors"
                style={{ background: "var(--teacher)" }}
              >
                Comenzar Pro
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 text-center text-xs text-muted">
          © {new Date().getFullYear()} StudyAI. Todos los derechos reservados.{" "}
          <Link href="/" className="hover:underline">Volver al inicio</Link>
        </div>
      </footer>
    </div>
  )
}

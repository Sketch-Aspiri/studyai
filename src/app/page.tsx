import Link from "next/link"
import { LandingHero } from "@/components/shared/landing-hero"
import { GlassBlogCard } from "@/components/ui/glass-blog-card"
import { BackgroundPathsCta } from "@/components/ui/background-paths"

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <LandingHero />

      <main className="flex-1">

        {/* Features section */}
        <section className="bg-surface py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-semibold text-center text-foreground mb-2">
              Todo lo que necesitas para estudiar mejor
            </h2>
            <p className="text-sm text-muted text-center mb-10">
              Powered by Claude AI — resultados en segundos
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <GlassBlogCard
                title="Resúmenes"
                excerpt="Obtén resúmenes claros y estructurados de tus documentos en segundos."
                image="https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&q=80"
                tags={["IA", "Automático"]}
                ctaLabel="Ver ejemplo"
                ctaHref="/signup"
              />
              <GlassBlogCard
                title="Mapas conceptuales"
                excerpt="Visualiza las relaciones entre ideas con mapas generados automáticamente."
                image="https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=800&q=80"
                tags={["Visual", "IA"]}
                ctaLabel="Ver ejemplo"
                ctaHref="/signup"
              />
              <GlassBlogCard
                title="Exámenes"
                excerpt="Genera exámenes de práctica o compártelos con tus alumnos mediante un enlace."
                image="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80"
                tags={["Maestros", "Compartir"]}
                ctaLabel="Ver ejemplo"
                ctaHref="/signup"
              />
              <GlassBlogCard
                title="Flashcards"
                excerpt="Memoriza conceptos clave con tarjetas de estudio interactivas."
                image="https://anurseinthemaking.com/cdn/shop/files/Thumbnails_FlashcardcardPack_4_7463b5de-2be4-43fd-809c-89d75b489052_1080x.png?v=1720029995"
                tags={["Interactivo", "IA"]}
                ctaLabel="Ver ejemplo"
                ctaHref="/signup"
              />
            </div>
          </div>
        </section>

        {/* Student / Teacher section */}
        <section className="py-16">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-2xl font-semibold text-center text-foreground mb-2">
              Diseñado para cada rol
            </h2>
            <p className="text-sm text-muted text-center mb-10">
              Una plataforma, dos experiencias a medida
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <GlassBlogCard
                title="Para Estudiantes"
                excerpt="Sube tus apuntes y genera recursos personalizados para estudiar más eficientemente. Resúmenes, mapas y flashcards en un clic."
                image="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80"
                tags={["Gratis", "Personal"]}
                ctaLabel="Comenzar como estudiante"
                ctaHref="/signup"
              />
              <GlassBlogCard
                title="Para Maestros"
                excerpt="Crea exámenes desde tus materiales y compártelos con tus alumnos mediante un enlace. Sin registro requerido para los alumnos."
                image="https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80"
                tags={["Exámenes", "Compartir"]}
                ctaLabel="Comenzar como maestro"
                ctaHref="/signup"
              />
            </div>
          </div>
        </section>

      </main>

      <BackgroundPathsCta
        title="¿Listo para estudiar mejor?"
        subtitle="Comienza gratis ahora"
        primaryLabel="Comenzar gratis"
        primaryHref="/signup"
        secondaryLabel="Ver precios"
        secondaryHref="/pricing"
      />

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} StudyAI. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-foreground transition-colors">Precios</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Registrarse</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

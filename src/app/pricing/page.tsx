"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { PricingCard } from "@/components/ui/pricing-card-1";
import { BackgroundPathsCta } from "@/components/ui/background-paths";

const studentPlans = [
  {
    title: "Estudiante Gratis",
    price: "$0",
    priceDescription: "Para siempre",
    description: "Ideal para empezar a estudiar con IA sin ningún compromiso.",
    features: [
      "2 proyectos",
      "3 documentos por proyecto",
      "15 generaciones al mes",
      "Todos los tipos de recurso",
    ],
    buttonText: "Comenzar gratis",
    isHighlighted: false,
  },
  {
    title: "Estudiante Pro",
    price: "$9.99",
    priceDescription: "/mes — cancela cuando quieras",
    description: "Para estudiantes que necesitan más proyectos y generaciones sin límite.",
    features: [
      "Proyectos ilimitados",
      "Documentos ilimitados",
      "200 generaciones al mes",
      "Todos los tipos de recurso",
    ],
    buttonText: "Comenzar Pro",
    isHighlighted: true,
    highlightLabel: "Popular",
  },
];

const teacherPlans = [
  {
    title: "Maestro Gratis",
    price: "$0",
    priceDescription: "Para siempre",
    description: "Perfecto para empezar a crear y compartir exámenes con tus alumnos.",
    features: [
      "2 proyectos",
      "3 documentos por proyecto",
      "15 generaciones al mes",
      "Publicar hasta 3 exámenes activos",
    ],
    buttonText: "Comenzar gratis",
    isHighlighted: false,
    highlightColor: "#059669",
  },
  {
    title: "Maestro Pro",
    price: "$12.99",
    priceDescription: "/mes — cancela cuando quieras",
    description: "Para maestros que quieren escalar su práctica con herramientas avanzadas.",
    features: [
      "Proyectos ilimitados",
      "Documentos ilimitados",
      "200 generaciones al mes",
      "Exámenes ilimitados",
      "Analíticas avanzadas",
    ],
    buttonText: "Comenzar Pro",
    isHighlighted: true,
    highlightLabel: "Popular",
    highlightColor: "#059669",
  },
];

export default function PricingPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50">
        <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold text-primary">StudyAI</Link>
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
        {/* Hero */}
        <section className="mx-auto max-w-5xl px-6 pt-16 pb-12 text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary mb-2">
            Planes y precios
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Precios simples y transparentes
          </h1>
          <p className="text-lg text-muted max-w-xl mx-auto">
            Empieza gratis. Mejora cuando lo necesites. Sin sorpresas.
          </p>
        </section>

        {/* Student plans */}
        <section className="mx-auto max-w-5xl px-6 pb-16">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🎓</span>
            <h2 className="text-xl font-semibold text-foreground">Para Estudiantes</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {studentPlans.map((plan) => (
              <PricingCard
                key={plan.title}
                {...plan}
                highlightColor="var(--primary)"
                onButtonClick={() => router.push("/signup")}
              />
            ))}
          </div>
        </section>

        {/* Teacher plans */}
        <section className="mx-auto max-w-5xl px-6 pb-20">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-2xl">🏫</span>
            <h2 className="text-xl font-semibold text-foreground">Para Maestros</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {teacherPlans.map((plan) => (
              <PricingCard
                key={plan.title}
                {...plan}
                onButtonClick={() => router.push("/signup")}
              />
            ))}
          </div>
        </section>
      </main>

      {/* CTA */}

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted">
          <span>© {new Date().getFullYear()} StudyAI. Todos los derechos reservados.</span>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-foreground transition-colors">Inicio</Link>
            <Link href="/signup" className="hover:text-foreground transition-colors">Registrarse</Link>
            <Link href="/login" className="hover:text-foreground transition-colors">Iniciar sesión</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

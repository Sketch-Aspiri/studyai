"use client"

import { useActionState } from "react"
import { selectRole } from "./actions"

const roles = [
  {
    value: "STUDENT",
    emoji: "🎓",
    title: "Estudiante",
    description:
      "Sube tus documentos y genera resúmenes, mapas conceptuales, exámenes y flashcards personalizados.",
    features: ["Resúmenes automáticos", "Mapas conceptuales", "Flashcards interactivas", "Exámenes de práctica"],
    color: "indigo",
  },
  {
    value: "TEACHER",
    emoji: "🏫",
    title: "Maestro",
    description:
      "Crea exámenes a partir de tus materiales y compártelos con tus alumnos mediante un enlace.",
    features: ["Generación de exámenes", "Compartir con alumnos", "Ver resultados", "Estadísticas de grupo"],
    color: "emerald",
  },
] as const

export default function OnboardingPage() {
  const [state, action, pending] = useActionState(selectRole, null)

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-primary">StudyAI</span>
          </div>
          <h1 className="text-3xl font-semibold text-foreground mb-3">
            ¿Cómo vas a usar StudyAI?
          </h1>
          <p className="text-muted">
            Elige tu rol para personalizar tu experiencia. Podrás cambiarlo más adelante.
          </p>
        </div>

        {state?.error && (
          <div className="mb-6 rounded-[--radius-sm] bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive text-center">
            {state.error}
          </div>
        )}

        <form action={action}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {roles.map((role) => (
              <label
                key={role.value}
                className="relative flex flex-col cursor-pointer group"
              >
                <input
                  type="radio"
                  name="role"
                  value={role.value}
                  className="sr-only peer"
                  required
                />
                <div
                  className={`
                    flex flex-col h-full rounded-[--radius-lg] border-2 border-border bg-white p-6
                    transition-all duration-150
                    peer-checked:border-primary peer-checked:shadow-md
                    group-hover:border-primary/40
                    ${role.color === "emerald" ? "peer-checked:border-[--teacher]" : ""}
                  `}
                >
                  <div className="text-4xl mb-3">{role.emoji}</div>
                  <h2 className={`text-lg font-semibold mb-2 ${role.color === "emerald" ? "text-[--teacher]" : "text-primary"}`}>
                    {role.title}
                  </h2>
                  <p className="text-sm text-muted mb-4">{role.description}</p>
                  <ul className="mt-auto space-y-1.5">
                    {role.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <svg className={`h-4 w-4 flex-shrink-0 ${role.color === "emerald" ? "text-[--teacher]" : "text-primary"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </label>
            ))}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-[--radius-sm] bg-primary px-4 py-3 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
          >
            {pending ? "Guardando…" : "Continuar"}
          </button>
        </form>
      </div>
    </div>
  )
}

"use client"

import { useActionState } from "react"
import { signup } from "@/app/auth/actions"
import { GoogleButton } from "@/components/auth/google-button"

export default function SignupPage() {
  const [state, action, pending] = useActionState(signup, null)

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">
        Crear cuenta
      </h1>
      <p className="text-sm text-muted mb-6">
        ¿Ya tienes cuenta?{" "}
        <a href="/login" className="text-primary hover:underline font-medium">
          Inicia sesión
        </a>
      </p>

      {state?.error && (
        <div className="mb-4 rounded-[--radius-sm] bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive">
          {state.error}
        </div>
      )}

      <form action={action} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1.5">
            Nombre completo
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            autoComplete="name"
            placeholder="Tu nombre"
            className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="tu@email.com"
            className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[--radius-sm] bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
        >
          {pending ? "Creando cuenta…" : "Crear cuenta gratis"}
        </button>
      </form>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs text-muted">o continúa con</span>
        </div>
      </div>

      <GoogleButton />

      <p className="mt-6 text-center text-xs text-muted">
        Al registrarte aceptas nuestros{" "}
        <a href="#" className="underline hover:text-foreground">Términos de uso</a>{" "}
        y{" "}
        <a href="#" className="underline hover:text-foreground">Política de privacidad</a>.
      </p>
    </div>
  )
}

"use client"

import { useActionState } from "react"
import { login } from "@/app/auth/actions"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { GoogleButton } from "@/components/auth/google-button"

function LoginForm() {
  const [state, action, pending] = useActionState(login, null)
  const searchParams = useSearchParams()
  const errorParam = searchParams.get("error")

  return (
    <div>
      <h1 className="text-2xl font-semibold text-foreground mb-1">
        Iniciar sesión
      </h1>
      <p className="text-sm text-muted mb-6">
        ¿No tienes cuenta?{" "}
        <a href="/signup" className="text-primary hover:underline font-medium">
          Regístrate gratis
        </a>
      </p>

      {(state?.error || errorParam) && (
        <div className="mb-4 rounded-[--radius-sm] bg-red-50 border border-red-200 px-4 py-3 text-sm text-destructive">
          {state?.error ?? errorParam}
        </div>
      )}

      <form action={action} className="space-y-4">
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
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-[--radius-sm] border border-border px-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-[--radius-sm] bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover disabled:opacity-60 transition-colors"
        >
          {pending ? "Iniciando sesión…" : "Iniciar sesión"}
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
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}

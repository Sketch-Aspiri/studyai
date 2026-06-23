import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { getGenerationUsage } from "@/lib/rate-limiter"
import Link from "next/link"
import { StripeCheckoutButton, StripePortalButton } from "@/components/shared/stripe-buttons"

export default async function TeacherBillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const dbUser = await db.user.findUnique({
    where: { id: user!.id },
    select: { subscription_status: true, subscription_ends_at: true },
  })

  const isPro = dbUser?.subscription_status === "PRO"
  const usage = await getGenerationUsage(user!.id, isPro)

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Plan y facturación</h1>
        <p className="text-muted mt-1">Administra tu suscripción y métodos de pago.</p>
      </div>

      <div className="space-y-4">
        <div className="bg-white rounded-[--radius-md] border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Uso este mes</h2>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-muted">Generaciones</span>
            <span className="font-medium text-foreground">
              {usage.used} / {usage.limit}
            </span>
          </div>
          <div className="h-2 rounded-full bg-surface overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (usage.used / usage.limit) * 100)}%`,
                background: usage.remaining === 0 ? "#EF4444" : "var(--teacher)",
              }}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="bg-white rounded-[--radius-md] border border-border p-6">
            <div className="text-sm font-medium text-muted mb-1">Plan actual</div>
            <div className="text-2xl font-semibold text-foreground mb-4">
              {isPro ? "Pro Maestro" : "Gratuito"}
            </div>
            <ul className="space-y-2 text-sm text-muted mb-4">
              {isPro ? (
                <>
                  <li>✓ Proyectos ilimitados</li>
                  <li>✓ Exámenes ilimitados</li>
                  <li>✓ 200 generaciones al mes</li>
                  <li>✓ Analíticas avanzadas</li>
                </>
              ) : (
                <>
                  <li>✓ 2 proyectos</li>
                  <li>✓ 3 exámenes activos</li>
                  <li>✓ 15 generaciones al mes</li>
                </>
              )}
            </ul>
            {isPro && dbUser?.subscription_ends_at && (
              <p className="text-xs text-muted">
                Renueva el{" "}
                {new Date(dbUser.subscription_ends_at).toLocaleDateString("es-MX")}
              </p>
            )}
          </div>

          {!isPro ? (
            <div
              className="bg-white rounded-[--radius-md] border-2 p-6 relative"
              style={{ borderColor: "var(--teacher)" }}
            >
              <div
                className="absolute -top-3 left-4 text-white text-xs font-semibold px-2 py-0.5 rounded-full"
                style={{ background: "var(--teacher)" }}
              >
                Recomendado
              </div>
              <div className="text-sm font-medium text-muted mb-1">Pro Maestro</div>
              <div className="text-2xl font-semibold text-foreground mb-4">
                $12.99<span className="text-sm font-normal text-muted">/mes</span>
              </div>
              <ul className="space-y-2 text-sm text-muted mb-6">
                <li>✓ Proyectos ilimitados</li>
                <li>✓ Exámenes ilimitados</li>
                <li>✓ 200 generaciones al mes</li>
                <li>✓ Analíticas avanzadas</li>
              </ul>
              <StripeCheckoutButton accentColor="var(--teacher)" />
            </div>
          ) : (
            <div className="bg-white rounded-[--radius-md] border border-border p-6 flex flex-col justify-between">
              <div>
                <div className="text-sm font-medium text-muted mb-1">Gestionar suscripción</div>
                <p className="text-sm text-muted mt-2">
                  Cambia tu método de pago, descarga facturas o cancela desde el portal de Stripe.
                </p>
              </div>
              <StripePortalButton className="mt-4" accentColor="var(--teacher)" />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4">
        <Link href="/teacher/settings" className="text-sm text-muted hover:text-foreground transition-colors">
          ← Volver a configuración
        </Link>
      </div>
    </div>
  )
}

import Link from "next/link"

export default function StudentBillingPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Plan y facturación</h1>
        <p className="text-muted mt-1">Administra tu suscripción y métodos de pago.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="bg-white rounded-[--radius-md] border border-border p-6">
          <div className="text-sm font-medium text-muted mb-1">Plan actual</div>
          <div className="text-2xl font-semibold text-foreground mb-4">Gratuito</div>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li>✓ 2 proyectos</li>
            <li>✓ 3 documentos por proyecto</li>
            <li>✓ 15 generaciones al mes</li>
          </ul>
          <div className="text-sm text-muted">Plan activo</div>
        </div>

        <div className="bg-white rounded-[--radius-md] border-2 border-primary p-6 relative">
          <div className="absolute -top-3 left-4 bg-primary text-white text-xs font-semibold px-2 py-0.5 rounded-full">
            Recomendado
          </div>
          <div className="text-sm font-medium text-muted mb-1">Pro</div>
          <div className="text-2xl font-semibold text-foreground mb-4">
            $9.99<span className="text-sm font-normal text-muted">/mes</span>
          </div>
          <ul className="space-y-2 text-sm text-muted mb-6">
            <li>✓ Proyectos ilimitados</li>
            <li>✓ Documentos ilimitados</li>
            <li>✓ 200 generaciones al mes</li>
          </ul>
          <button className="w-full rounded-[--radius-sm] bg-primary px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-hover transition-colors">
            Mejorar a Pro
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Link href="/settings" className="text-sm text-muted hover:text-foreground transition-colors">
          ← Volver a configuración
        </Link>
      </div>
    </div>
  )
}

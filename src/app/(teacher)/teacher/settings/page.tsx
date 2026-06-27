import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import Link from "next/link"
import { ProfileEditForm } from "@/components/shared/profile-edit-form"

export default async function TeacherSettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const dbUser = user
    ? await db.user.findUnique({ where: { id: user.id }, select: { name: true } })
    : null

  const name =
    dbUser?.name ??
    user?.user_metadata?.name ??
    user?.user_metadata?.full_name ??
    ""

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
        <p className="text-muted mt-1">Administra tu perfil y plan de suscripción.</p>
      </div>

      <div className="space-y-4">
        <section className="bg-white rounded-[--radius-md] border border-border p-6">
          <h2 className="text-base font-semibold text-foreground mb-4">Perfil</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Nombre</p>
              <ProfileEditForm initialName={name} accentColor="#059669" />
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Email</p>
              <p className="text-sm text-foreground">{user?.email}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-wide mb-1">Rol</p>
              <p className="text-sm font-medium" style={{ color: "var(--teacher)" }}>Maestro</p>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-[--radius-md] border border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Plan</h2>
              <p className="text-sm text-muted mt-0.5">Plan Gratuito — 2 proyectos, 3 exámenes activos</p>
            </div>
            <Link
              href="/teacher/settings/billing"
              className="rounded-[--radius-sm] px-4 py-2 text-sm font-medium text-white transition-colors"
              style={{ background: "var(--teacher)" }}
            >
              Mejorar plan
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

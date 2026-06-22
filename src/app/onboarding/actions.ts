"use server"

import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { redirect } from "next/navigation"
import { z } from "zod"

const roleSchema = z.enum(["STUDENT", "TEACHER"])

type ActionState = { error: string } | null

export async function selectRole(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = roleSchema.safeParse(formData.get("role"))

  if (!parsed.success) {
    return { error: "Selecciona un rol válido." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "No autenticado." }
  }

  const { error: updateError } = await supabase.auth.updateUser({
    data: { role: parsed.data },
  })

  if (updateError) {
    return { error: "Error al guardar el rol. Intenta de nuevo." }
  }

  await db.user.upsert({
    where: { id: user.id },
    create: {
      id: user.id,
      email: user.email!,
      name: user.user_metadata?.name ?? user.user_metadata?.full_name ?? null,
      avatar_url: user.user_metadata?.avatar_url ?? null,
      role: parsed.data,
    },
    update: {
      role: parsed.data,
    },
  })

  redirect(parsed.data === "TEACHER" ? "/teacher/dashboard" : "/dashboard")
}

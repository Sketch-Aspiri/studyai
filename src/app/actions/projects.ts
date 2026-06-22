"use server"

import { db } from "@/lib/db"
import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { z } from "zod"

const FREE_PROJECT_LIMIT = 2

const createSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio").max(100),
  emoji: z.string().default("📁"),
  description: z.string().max(300).optional(),
})

const updateSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  emoji: z.string(),
  description: z.string().max(300).optional(),
})

type ActionResult = { error: string } | null

export async function createProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const parsed = createSchema.safeParse({
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "📁",
    description: (formData.get("description") as string) || undefined,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Datos inválidos." }
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { subscription_status: true },
  })

  if (!dbUser || dbUser.subscription_status === "FREE") {
    const count = await db.project.count({
      where: { user_id: user.id, deleted_at: null },
    })
    if (count >= FREE_PROJECT_LIMIT) {
      return {
        error: `Has alcanzado el límite de ${FREE_PROJECT_LIMIT} proyectos del plan Gratuito. Mejora a Pro para crear más.`,
      }
    }
  }

  await db.project.create({
    data: {
      user_id: user.id,
      name: parsed.data.name,
      emoji: parsed.data.emoji,
      description: parsed.data.description,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/teacher/dashboard")
  return null
}

export async function updateProject(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const parsed = updateSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    emoji: formData.get("emoji") ?? "📁",
    description: (formData.get("description") as string) || undefined,
  })
  if (!parsed.success) return { error: "Datos inválidos." }

  const project = await db.project.findFirst({
    where: { id: parsed.data.id, user_id: user.id, deleted_at: null },
  })
  if (!project) return { error: "Proyecto no encontrado." }

  await db.project.update({
    where: { id: parsed.data.id },
    data: {
      name: parsed.data.name,
      emoji: parsed.data.emoji,
      description: parsed.data.description ?? null,
    },
  })

  revalidatePath("/dashboard")
  revalidatePath("/teacher/dashboard")
  return null
}

export async function deleteProject(projectId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
  })
  if (!project) return { error: "Proyecto no encontrado." }

  await db.project.update({
    where: { id: projectId },
    data: { deleted_at: new Date() },
  })

  revalidatePath("/dashboard")
  revalidatePath("/teacher/dashboard")
  return null
}

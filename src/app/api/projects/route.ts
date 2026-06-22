import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { z } from "zod"

const FREE_PROJECT_LIMIT = 2

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const projects = await db.project.findMany({
    where: { user_id: user.id, deleted_at: null },
    include: { _count: { select: { documents: true, resources: true } } },
    orderBy: { updated_at: "desc" },
  })

  return NextResponse.json(projects)
}

const createSchema = z.object({
  name: z.string().min(1).max(100),
  emoji: z.string().optional().default("📁"),
  description: z.string().max(300).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body: unknown = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
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
      return NextResponse.json(
        { error: "Límite de proyectos del plan Gratuito alcanzado" },
        { status: 403 }
      )
    }
  }

  const project = await db.project.create({
    data: {
      user_id: user.id,
      name: parsed.data.name,
      emoji: parsed.data.emoji,
      description: parsed.data.description,
    },
  })

  return NextResponse.json(project, { status: 201 })
}

import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { z } from "zod"

type RouteParams = { params: Promise<{ projectId: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { projectId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
    include: {
      documents: { orderBy: { created_at: "desc" } },
      resources: { orderBy: { created_at: "desc" } },
    },
  })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  return NextResponse.json(project)
}

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  emoji: z.string().optional(),
  description: z.string().max(300).nullish(),
})

export async function PATCH(request: Request, { params }: RouteParams) {
  const { projectId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body: unknown = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
  })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  const updated = await db.project.update({
    where: { id: projectId },
    data: {
      ...(parsed.data.name !== undefined && { name: parsed.data.name }),
      ...(parsed.data.emoji !== undefined && { emoji: parsed.data.emoji }),
      ...(parsed.data.description !== undefined && { description: parsed.data.description }),
    },
  })

  return NextResponse.json(updated)
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { projectId } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const project = await db.project.findFirst({
    where: { id: projectId, user_id: user.id, deleted_at: null },
  })
  if (!project) return NextResponse.json({ error: "No encontrado" }, { status: 404 })

  await db.project.update({
    where: { id: projectId },
    data: { deleted_at: new Date() },
  })

  return new NextResponse(null, { status: 204 })
}

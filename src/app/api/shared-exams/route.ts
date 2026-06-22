import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 8)

const createSchema = z.object({
  resource_id: z.string().min(1),
  title: z.string().min(1).max(200),
  instructions: z.string().max(1000).optional(),
  time_limit_minutes: z.number().int().min(1).max(180).optional(),
})

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== "TEACHER") {
    return NextResponse.json({ error: "Solo los maestros pueden publicar exámenes" }, { status: 403 })
  }

  const body: unknown = await request.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos" }, { status: 400 })
  }

  const resource = await db.resource.findFirst({
    where: { id: parsed.data.resource_id, user_id: user.id },
  })
  if (!resource) {
    return NextResponse.json({ error: "Recurso no encontrado" }, { status: 404 })
  }
  if (resource.type !== "EXAM") {
    return NextResponse.json({ error: "Solo se pueden publicar recursos de tipo Examen" }, { status: 400 })
  }

  let share_code = nanoid()
  // Ensure uniqueness (collision is extremely rare but guard anyway)
  let attempts = 0
  while (attempts < 5) {
    const existing = await db.sharedExam.findUnique({ where: { share_code } })
    if (!existing) break
    share_code = nanoid()
    attempts++
  }

  const sharedExam = await db.sharedExam.create({
    data: {
      teacher_id: user.id,
      resource_id: parsed.data.resource_id,
      share_code,
      title: parsed.data.title,
      instructions: parsed.data.instructions ?? null,
      time_limit_minutes: parsed.data.time_limit_minutes ?? null,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  return NextResponse.json(
    {
      id: sharedExam.id,
      share_code: sharedExam.share_code,
      share_url: `${appUrl}/exam/${sharedExam.share_code}`,
    },
    { status: 201 }
  )
}

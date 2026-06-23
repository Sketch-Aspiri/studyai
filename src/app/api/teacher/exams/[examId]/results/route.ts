import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ examId: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { examId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const exam = await db.sharedExam.findFirst({
    where: { id: examId, teacher_id: user.id },
    include: {
      attempts: {
        orderBy: { created_at: "desc" },
        select: {
          id: true,
          student_name: true,
          student_email: true,
          score: true,
          total_questions: true,
          correct_answers: true,
          started_at: true,
          completed_at: true,
          created_at: true,
        },
      },
    },
  })

  if (!exam) return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 })

  const scores = exam.attempts.map((a) => a.score)
  const avgScore = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
  const passRate =
    scores.length > 0 ? (scores.filter((s) => s >= 60).length / scores.length) * 100 : null

  return NextResponse.json({
    exam: {
      id: exam.id,
      title: exam.title,
      share_code: exam.share_code,
      instructions: exam.instructions,
      time_limit_minutes: exam.time_limit_minutes,
      is_active: exam.is_active,
    },
    analytics: {
      total_attempts: exam.attempts.length,
      avg_score: avgScore !== null ? Math.round(avgScore * 10) / 10 : null,
      pass_rate: passRate !== null ? Math.round(passRate * 10) / 10 : null,
    },
    attempts: exam.attempts,
  })
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const { examId } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const body: unknown = await request.json()
  const { is_active } = body as { is_active?: boolean }
  if (typeof is_active !== "boolean") {
    return NextResponse.json({ error: "is_active debe ser booleano" }, { status: 400 })
  }

  const exam = await db.sharedExam.findFirst({
    where: { id: examId, teacher_id: user.id },
  })
  if (!exam) return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 })

  const updated = await db.sharedExam.update({
    where: { id: examId },
    data: { is_active },
  })

  return NextResponse.json(updated)
}

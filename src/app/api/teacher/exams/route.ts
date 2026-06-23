import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== "TEACHER") {
    return NextResponse.json({ error: "Solo los maestros pueden ver sus exámenes" }, { status: 403 })
  }

  const exams = await db.sharedExam.findMany({
    where: { teacher_id: user.id },
    include: {
      _count: { select: { attempts: true } },
      attempts: {
        select: { score: true },
      },
    },
    orderBy: { created_at: "desc" },
  })

  const result = exams.map((exam) => {
    const scores = exam.attempts.map((a) => a.score)
    const avg = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : null
    return {
      id: exam.id,
      title: exam.title,
      share_code: exam.share_code,
      instructions: exam.instructions,
      time_limit_minutes: exam.time_limit_minutes,
      is_active: exam.is_active,
      created_at: exam.created_at,
      attempts_count: exam._count.attempts,
      avg_score: avg !== null ? Math.round(avg * 10) / 10 : null,
    }
  })

  return NextResponse.json(result)
}

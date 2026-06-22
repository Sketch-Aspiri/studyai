import { NextResponse } from "next/server"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ shareCode: string }> }

export async function GET(_request: Request, { params }: RouteParams) {
  const { shareCode } = await params

  const sharedExam = await db.sharedExam.findUnique({
    where: { share_code: shareCode },
    include: {
      resource: { select: { content: true } },
      teacher: { select: { name: true, email: true } },
    },
  })

  if (!sharedExam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 })
  }
  if (!sharedExam.is_active) {
    return NextResponse.json({ error: "Este examen ya no está disponible" }, { status: 410 })
  }

  const content = sharedExam.resource.content as unknown as { questions?: unknown[] }
  const totalQuestions = content?.questions?.length ?? 0

  return NextResponse.json({
    id: sharedExam.id,
    title: sharedExam.title,
    instructions: sharedExam.instructions,
    time_limit_minutes: sharedExam.time_limit_minutes,
    total_questions: totalQuestions,
    teacher_name: sharedExam.teacher.name ?? sharedExam.teacher.email,
    is_active: sharedExam.is_active,
  })
}

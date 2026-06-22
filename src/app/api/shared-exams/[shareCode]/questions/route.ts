import { NextResponse } from "next/server"
import { db } from "@/lib/db"

type RouteParams = { params: Promise<{ shareCode: string }> }

interface Question {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

interface ExamContent {
  questions: Question[]
}

export async function GET(_request: Request, { params }: RouteParams) {
  const { shareCode } = await params

  const sharedExam = await db.sharedExam.findUnique({
    where: { share_code: shareCode },
    include: { resource: { select: { content: true } } },
  })

  if (!sharedExam) {
    return NextResponse.json({ error: "Examen no encontrado" }, { status: 404 })
  }
  if (!sharedExam.is_active) {
    return NextResponse.json({ error: "Este examen ya no está disponible" }, { status: 410 })
  }

  const content = sharedExam.resource.content as unknown as ExamContent
  const questions = (content.questions ?? []).map(({ id, question, options }) => ({
    id,
    question,
    options,
  }))

  return NextResponse.json({ questions })
}

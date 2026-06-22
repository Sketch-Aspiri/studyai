import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { z } from "zod"

type RouteParams = { params: Promise<{ shareCode: string }> }

const answerSchema = z.object({
  question_id: z.string(),
  selected_index: z.number().int().min(0),
})

const submitSchema = z.object({
  student_name: z.string().min(1).max(100),
  student_email: z.string().email().optional().or(z.literal("")),
  answers: z.array(answerSchema).min(1),
  started_at: z.string().datetime(),
})

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

export async function POST(request: Request, { params }: RouteParams) {
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

  const body: unknown = await request.json()
  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Datos inválidos", details: parsed.error.issues }, { status: 400 })
  }

  const { student_name, student_email, answers, started_at } = parsed.data
  const content = sharedExam.resource.content as unknown as ExamContent
  const questions = content.questions ?? []

  // Identify the student if they are logged in
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const student_id = user?.id ?? null

  // Grade the attempt
  let correct_answers = 0
  const results = questions.map((q) => {
    const answer = answers.find((a) => a.question_id === q.id)
    const selected_index = answer?.selected_index ?? -1
    const is_correct = selected_index === q.correct_index
    if (is_correct) correct_answers++
    return {
      question: q.question,
      options: q.options,
      selected_index,
      correct_index: q.correct_index,
      is_correct,
      explanation: q.explanation,
    }
  })

  const total_questions = questions.length
  const score = total_questions > 0 ? Math.round((correct_answers / total_questions) * 100) : 0

  await db.examAttempt.create({
    data: {
      shared_exam_id: sharedExam.id,
      student_id,
      student_name,
      student_email: student_email || null,
      answers: answers as object[],
      score,
      total_questions,
      correct_answers,
      started_at: new Date(started_at),
      completed_at: new Date(),
    },
  })

  return NextResponse.json(
    { score, correct_answers, total_questions, results },
    { status: 201 }
  )
}

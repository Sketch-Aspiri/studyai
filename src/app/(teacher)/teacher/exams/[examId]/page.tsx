import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { AnalyticsSummary } from "@/components/teacher/analytics-summary"
import { StudentResultsTable } from "@/components/teacher/student-results-table"
import { ToggleExamStatus } from "@/components/teacher/toggle-exam-status"
import Link from "next/link"

type PageProps = { params: Promise<{ examId: string }> }

export default async function ExamResultsPage({ params }: PageProps) {
  const { examId } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const exam = await db.sharedExam.findFirst({
    where: { id: examId, teacher_id: user!.id },
    include: {
      attempts: {
        orderBy: { created_at: "desc" },
      },
    },
  })

  if (!exam) notFound()

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const shareUrl = `${appUrl}/exam/${exam.share_code}`

  const scores = exam.attempts.map((a) => a.score)
  const avgScore =
    scores.length > 0
      ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
      : null
  const passRate =
    scores.length > 0
      ? Math.round((scores.filter((s) => s >= 60).length / scores.length) * 1000) / 10
      : null

  const attempts = exam.attempts.map((a) => ({
    ...a,
    started_at: a.started_at.toISOString(),
    completed_at: a.completed_at?.toISOString() ?? null,
    created_at: a.created_at.toISOString(),
  }))

  return (
    <div className="p-8">
      <div className="mb-2">
        <Link
          href="/teacher/exams"
          className="text-sm text-muted hover:text-foreground transition-colors"
        >
          ← Mis exámenes
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{exam.title}</h1>
          <div className="flex items-center gap-3 mt-2">
            <code className="rounded bg-surface px-2 py-1 text-xs font-mono text-muted border border-border">
              {exam.share_code}
            </code>
            <a
              href={shareUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs hover:underline"
              style={{ color: "var(--teacher)" }}
            >
              Ver examen →
            </a>
          </div>
        </div>
        <ToggleExamStatus
          examId={exam.id}
          isActive={exam.is_active}
        />
      </div>

      <AnalyticsSummary
        totalAttempts={exam.attempts.length}
        avgScore={avgScore}
        passRate={passRate}
      />

      <h2 className="text-lg font-semibold text-foreground mb-4">Resultados por alumno</h2>
      <StudentResultsTable attempts={attempts} />
    </div>
  )
}

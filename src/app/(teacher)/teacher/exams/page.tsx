import { createClient } from "@/lib/supabase/server"
import { db } from "@/lib/db"
import { SharedExamCard } from "@/components/teacher/shared-exam-card"

export default async function TeacherExamsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const exams = await db.sharedExam.findMany({
    where: { teacher_id: user!.id },
    include: {
      _count: { select: { attempts: true } },
      attempts: { select: { score: true } },
    },
    orderBy: { created_at: "desc" },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

  const examsWithStats = exams.map((exam) => {
    const scores = exam.attempts.map((a) => a.score)
    const avgScore =
      scores.length > 0
        ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
        : null
    return {
      id: exam.id,
      title: exam.title,
      share_code: exam.share_code,
      is_active: exam.is_active,
      attempts_count: exam._count.attempts,
      avg_score: avgScore,
      created_at: exam.created_at.toISOString(),
    }
  })

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Mis exámenes</h1>
        <p className="text-muted mt-1">
          {exams.length === 0
            ? "Aún no has publicado ningún examen."
            : `${exams.length} examen${exams.length !== 1 ? "es" : ""} publicado${exams.length !== 1 ? "s" : ""}`}
        </p>
      </div>

      {exams.length === 0 ? (
        <div className="bg-white rounded-[--radius-md] border border-border p-10 flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="text-5xl mb-4">📋</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Publica tu primer examen
          </h2>
          <p className="text-sm text-muted">
            Ve a un proyecto, genera un examen con IA y pulsa{" "}
            <strong>Publicar examen</strong> para obtener un enlace compartible.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examsWithStats.map((exam) => (
            <SharedExamCard key={exam.id} exam={exam} appUrl={appUrl} />
          ))}
        </div>
      )}
    </div>
  )
}

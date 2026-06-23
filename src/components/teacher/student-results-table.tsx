interface Attempt {
  id: string
  student_name: string | null
  student_email: string | null
  score: number
  total_questions: number
  correct_answers: number
  completed_at: string | null
  created_at: string
}

interface StudentResultsTableProps {
  attempts: Attempt[]
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function StudentResultsTable({ attempts }: StudentResultsTableProps) {
  if (attempts.length === 0) {
    return (
      <div className="bg-white rounded-[--radius-md] border border-border p-10 text-center">
        <div className="text-4xl mb-3">📭</div>
        <p className="text-muted text-sm">Aún no hay intentos en este examen.</p>
        <p className="text-xs text-muted mt-1">Comparte el enlace con tus alumnos para comenzar.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-[--radius-md] border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface">
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                Alumno
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                Email
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                Correctas
              </th>
              <th className="text-center px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                Puntaje
              </th>
              <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wide">
                Fecha
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {attempts.map((a) => {
              const passed = a.score >= 60
              return (
                <tr key={a.id} className="hover:bg-surface transition-colors">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {a.student_name ?? "Anónimo"}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {a.student_email ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-center text-muted">
                    {a.correct_answers}/{a.total_questions}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className="inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold"
                      style={{
                        background: passed ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                        color: passed ? "#10B981" : "#EF4444",
                      }}
                    >
                      {a.score}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs">
                    {formatDate(a.completed_at ?? a.created_at)}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

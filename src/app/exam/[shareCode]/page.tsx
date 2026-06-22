"use client"

import { use, useEffect, useRef, useState } from "react"

interface ExamInfo {
  id: string
  title: string
  instructions: string | null
  time_limit_minutes: number | null
  total_questions: number
  teacher_name: string
  is_active: boolean
}

interface QuestionResult {
  question: string
  options: string[]
  selected_index: number
  correct_index: number
  is_correct: boolean
  explanation: string
}

interface AttemptResult {
  score: number
  correct_answers: number
  total_questions: number
  results: QuestionResult[]
}

type PageProps = { params: Promise<{ shareCode: string }> }

export default function PublicExamPage({ params }: PageProps) {
  const { shareCode } = use(params)

  const [examInfo, setExamInfo] = useState<ExamInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Identity form
  const [studentName, setStudentName] = useState("")
  const [studentEmail, setStudentEmail] = useState("")
  const [identitySubmitted, setIdentitySubmitted] = useState(false)

  // Timer
  const startedAtRef = useRef<string>(new Date().toISOString())
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Exam state
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)

  // Fetch exam info
  useEffect(() => {
    fetch(`/api/shared-exams/${shareCode}`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { error?: string } & Partial<ExamInfo>
        if (d.error) { setLoadError(d.error); return }
        setExamInfo(data as ExamInfo)
      })
      .catch(() => setLoadError("Error al cargar el examen."))
  }, [shareCode])

  // Start timer once identity submitted
  function startTimer(minutes: number) {
    setSecondsLeft(minutes * 60)
  }

  useEffect(() => {
    if (secondsLeft === null) return
    if (secondsLeft <= 0) {
      if (timerRef.current) clearInterval(timerRef.current)
      handleSubmit()
      return
    }
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => (s !== null ? s - 1 : null))
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [secondsLeft])

  function handleIdentitySubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!studentName.trim()) return
    startedAtRef.current = new Date().toISOString()
    if (examInfo?.time_limit_minutes) startTimer(examInfo.time_limit_minutes)
    setIdentitySubmitted(true)
  }

  function selectAnswer(questionId: string, index: number) {
    setAnswers((prev) => ({ ...prev, [questionId]: index }))
  }

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    if (timerRef.current) clearInterval(timerRef.current)

    const answersArray = Object.entries(answers).map(([question_id, selected_index]) => ({
      question_id,
      selected_index,
    }))

    try {
      const res = await fetch(`/api/shared-exams/${shareCode}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          student_name: studentName,
          student_email: studentEmail || undefined,
          answers: answersArray,
          started_at: startedAtRef.current,
        }),
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const errData = data as { error?: string }
        setSubmitError(errData.error ?? "Error al enviar respuestas")
        setSubmitting(false)
        return
      }
      setResult(data as AttemptResult)
    } catch {
      setSubmitError("Error de conexión. Intenta de nuevo.")
      setSubmitting(false)
    }
  }

  // ── Loading / error ──────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-border p-8 max-w-sm w-full text-center">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
            <svg className="h-6 w-6 text-destructive" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-base font-semibold text-foreground mb-1">Examen no disponible</h1>
          <p className="text-sm text-muted">{loadError}</p>
        </div>
      </div>
    )
  }

  if (!examInfo) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: "#4F46E5", borderTopColor: "transparent" }} />
      </div>
    )
  }

  // ── Results ──────────────────────────────────────────────────────────────
  if (result) {
    const pct = result.score
    const color = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444"
    return (
      <div className="min-h-screen bg-surface py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score card */}
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <p className="text-sm font-medium text-muted mb-1">{examInfo.title}</p>
            <div className="text-5xl font-bold my-4" style={{ color }}>{pct}%</div>
            <p className="text-sm text-muted">
              {result.correct_answers} de {result.total_questions} respuestas correctas
            </p>
            <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color }} />
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color }}>
              {pct >= 70 ? "¡Aprobado!" : pct >= 50 ? "Cerca de aprobar" : "Necesitas repasar más"}
            </p>
          </div>

          {/* Question review */}
          <div className="space-y-3">
            {result.results.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: r.is_correct ? "#10B981" : "#EF4444" }}>
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span
                      className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5"
                      style={{ background: r.is_correct ? "#10B981" : "#EF4444" }}
                    >
                      {r.is_correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-3">{i + 1}. {r.question}</p>
                      <div className="space-y-1.5">
                        {r.options.map((opt, idx) => {
                          const isCorrect = idx === r.correct_index
                          const isSelected = idx === r.selected_index
                          return (
                            <div
                              key={idx}
                              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm"
                              style={{
                                background: isCorrect ? "rgba(16,185,129,0.08)" : isSelected && !isCorrect ? "rgba(239,68,68,0.08)" : undefined,
                                borderWidth: 1,
                                borderStyle: "solid",
                                borderColor: isCorrect ? "#10B981" : isSelected && !isCorrect ? "#EF4444" : "#E5E7EB",
                                color: isCorrect ? "#059669" : isSelected && !isCorrect ? "#EF4444" : "#374151",
                              }}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + idx)})</span>
                              {opt}
                              {isCorrect && <span className="ml-auto text-success text-xs font-medium">Correcta</span>}
                              {isSelected && !isCorrect && <span className="ml-auto text-destructive text-xs font-medium">Tu respuesta</span>}
                            </div>
                          )
                        })}
                      </div>
                      {r.explanation && (
                        <p className="mt-3 text-xs text-muted border-t border-border pt-2">{r.explanation}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // ── Identity form ────────────────────────────────────────────────────────
  if (!identitySubmitted) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <div className="bg-white rounded-xl border border-border p-6 max-w-sm w-full">
          {/* Header */}
          <div className="mb-5">
            <p className="text-xs font-medium text-muted mb-1">Examen de {examInfo.teacher_name}</p>
            <h1 className="text-lg font-semibold text-foreground">{examInfo.title}</h1>
            {examInfo.instructions && (
              <p className="mt-2 text-sm text-muted">{examInfo.instructions}</p>
            )}
            <div className="flex gap-3 mt-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {examInfo.total_questions} preguntas
              </span>
              {examInfo.time_limit_minutes && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {examInfo.time_limit_minutes} min
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleIdentitySubmit} className="space-y-3">
            <div>
              <label htmlFor="student-name" className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                Tu nombre
              </label>
              <input
                id="student-name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
                maxLength={100}
                placeholder="Nombre completo"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-colors"
              />
            </div>
            <div>
              <label htmlFor="student-email" className="block text-xs font-medium text-muted uppercase tracking-wide mb-1.5">
                Email <span className="normal-case font-normal">(opcional)</span>
              </label>
              <input
                id="student-email"
                type="email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full rounded-lg border border-border px-3 py-2.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-transparent transition-colors"
              />
            </div>
            <button
              type="submit"
              disabled={!studentName.trim()}
              className="w-full min-h-[44px] rounded-lg text-sm font-medium text-white bg-primary hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Comenzar examen
            </button>
          </form>
        </div>
      </div>
    )
  }

  // ── Exam questions (need to fetch actual questions) ───────────────────────
  // We re-fetch resource questions from the attempt endpoint on submit, but
  // for rendering we get question text from the GET endpoint (no correct answers).
  // For the live exam UI we need the question list — fetch the public exam data again.
  // Since examInfo doesn't have questions, we use a placeholder approach:
  // Show a minimal "answer by question_id" interface using question numbers.
  // The actual question text requires a second fetch — we do it inside the component.
  return <ExamQuestions shareCode={shareCode} examInfo={examInfo} studentName={studentName} studentEmail={studentEmail} startedAt={startedAtRef.current} secondsLeft={secondsLeft} />
}

// Inner component that fetches the actual questions for the exam UI
function ExamQuestions({
  shareCode,
  examInfo,
  studentName,
  studentEmail,
  startedAt,
  secondsLeft,
}: {
  shareCode: string
  examInfo: ExamInfo
  studentName: string
  studentEmail: string
  startedAt: string
  secondsLeft: number | null
}) {
  interface Question {
    id: string
    question: string
    options: string[]
  }

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQ, setCurrentQ] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [result, setResult] = useState<AttemptResult | null>(null)
  const [timeLeft, setTimeLeft] = useState(secondsLeft)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Fetch questions (without correct answers — the API strips them)
  // We re-use the resource content via a dedicated endpoint that only exposes question + options
  useEffect(() => {
    fetch(`/api/shared-exams/${shareCode}/questions`)
      .then((r) => r.json())
      .then((data: unknown) => {
        const d = data as { questions?: Question[] }
        if (d.questions) setQuestions(d.questions)
      })
      .catch(() => {/* silently ignore — questions will be empty */ })
  }, [shareCode])

  // Timer
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          clearInterval(timerRef.current!)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])// run once

  // Auto-submit when timer hits 0
  useEffect(() => {
    if (timeLeft === 0 && !submitting && !result) {
      void handleSubmit()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft])

  async function handleSubmit() {
    if (submitting) return
    setSubmitting(true)
    setSubmitError(null)
    if (timerRef.current) clearInterval(timerRef.current)

    const answersArray = Object.entries(answers).map(([question_id, selected_index]) => ({
      question_id,
      selected_index,
    }))

    try {
      const res = await fetch(`/api/shared-exams/${shareCode}/attempts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ student_name: studentName, student_email: studentEmail || undefined, answers: answersArray, started_at: startedAt }),
      })
      const data: unknown = await res.json()
      if (!res.ok) {
        const errData = data as { error?: string }
        setSubmitError(errData.error ?? "Error al enviar")
        setSubmitting(false)
        return
      }
      setResult(data as AttemptResult)
    } catch {
      setSubmitError("Error de conexión.")
      setSubmitting(false)
    }
  }

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`
  const totalQ = questions.length || examInfo.total_questions
  const answered = Object.keys(answers).length

  // ── Results view (inline) ───────────────────────────────────────────────
  if (result) {
    const pct = result.score
    const color = pct >= 70 ? "#10B981" : pct >= 50 ? "#F59E0B" : "#EF4444"
    return (
      <div className="min-h-screen bg-surface py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <p className="text-sm font-medium text-muted mb-1">{examInfo.title}</p>
            <div className="text-5xl font-bold my-4" style={{ color }}>{pct}%</div>
            <p className="text-sm text-muted">{result.correct_answers} de {result.total_questions} respuestas correctas</p>
            <div className="mt-4 h-2 rounded-full bg-border overflow-hidden">
              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
            </div>
            <p className="mt-3 text-sm font-medium" style={{ color }}>
              {pct >= 70 ? "¡Aprobado!" : pct >= 50 ? "Cerca de aprobar" : "Necesitas repasar más"}
            </p>
          </div>
          <div className="space-y-3">
            {result.results.map((r, i) => (
              <div key={i} className="bg-white rounded-xl border overflow-hidden" style={{ borderColor: r.is_correct ? "#10B981" : "#EF4444" }}>
                <div className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold text-white mt-0.5" style={{ background: r.is_correct ? "#10B981" : "#EF4444" }}>
                      {r.is_correct ? "✓" : "✗"}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground mb-3">{i + 1}. {r.question}</p>
                      <div className="space-y-1.5">
                        {r.options.map((opt, idx) => {
                          const isCorrect = idx === r.correct_index
                          const isSelected = idx === r.selected_index
                          return (
                            <div key={idx} className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm border"
                              style={{
                                background: isCorrect ? "rgba(16,185,129,0.08)" : isSelected && !isCorrect ? "rgba(239,68,68,0.08)" : undefined,
                                borderColor: isCorrect ? "#10B981" : isSelected && !isCorrect ? "#EF4444" : "#E5E7EB",
                                color: isCorrect ? "#059669" : isSelected && !isCorrect ? "#EF4444" : "#374151",
                              }}
                            >
                              <span className="font-medium">{String.fromCharCode(65 + idx)})</span> {opt}
                              {isCorrect && <span className="ml-auto text-xs font-medium" style={{ color: "#10B981" }}>Correcta</span>}
                              {isSelected && !isCorrect && <span className="ml-auto text-xs font-medium text-destructive">Tu respuesta</span>}
                            </div>
                          )
                        })}
                      </div>
                      {r.explanation && <p className="mt-3 text-xs text-muted border-t border-border pt-2">{r.explanation}</p>}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const q = questions[currentQ]

  return (
    <div className="min-h-screen bg-surface py-6 px-4">
      <div className="max-w-xl mx-auto space-y-4">
        {/* Sticky header */}
        <div className="bg-white rounded-xl border border-border p-4 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted truncate">{examInfo.title}</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 h-1.5 rounded-full bg-border overflow-hidden">
                <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${(answered / totalQ) * 100}%` }} />
              </div>
              <span className="text-xs text-muted flex-shrink-0">{answered}/{totalQ}</span>
            </div>
          </div>
          {timeLeft !== null && (
            <div className={`text-sm font-mono font-semibold flex-shrink-0 ${timeLeft < 60 ? "text-destructive" : "text-foreground"}`}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>

        {/* Question card */}
        {q ? (
          <div className="bg-white rounded-xl border border-border p-5 space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted">Pregunta {currentQ + 1} de {questions.length}</span>
            </div>
            <p className="text-base font-medium text-foreground">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((opt, idx) => {
                const selected = answers[q.id] === idx
                return (
                  <button
                    key={idx}
                    onClick={() => setAnswers((prev) => ({ ...prev, [q.id]: idx }))}
                    className="w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm text-left transition-colors cursor-pointer"
                    style={selected
                      ? { borderColor: "#4F46E5", background: "rgba(79,70,229,0.06)", color: "#4F46E5" }
                      : { borderColor: "#E5E7EB", color: "#374151" }
                    }
                  >
                    <span className="flex-shrink-0 h-5 w-5 rounded-full border-2 flex items-center justify-center text-xs"
                      style={selected ? { borderColor: "#4F46E5", background: "#4F46E5", color: "#fff" } : { borderColor: "#D1D5DB" }}
                    >
                      {selected ? "✓" : String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCurrentQ((i) => i - 1)}
                disabled={currentQ === 0}
                className="flex-1 min-h-[44px] rounded-lg border border-border text-sm text-muted hover:text-foreground disabled:opacity-40 transition-colors cursor-pointer"
              >
                ← Anterior
              </button>
              {currentQ < questions.length - 1 ? (
                <button
                  onClick={() => setCurrentQ((i) => i + 1)}
                  className="flex-1 min-h-[44px] rounded-lg text-sm font-medium text-white bg-primary hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Siguiente →
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex-1 min-h-[44px] rounded-lg text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer"
                  style={{ background: "#10B981" }}
                >
                  {submitting ? "Enviando..." : "Entregar examen"}
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Questions not loaded yet — show simple submit */
          <div className="bg-white rounded-xl border border-border p-6 text-center">
            <p className="text-sm text-muted mb-4">Cargando preguntas...</p>
            <div className="h-6 w-6 rounded-full border-2 border-t-transparent animate-spin mx-auto" style={{ borderColor: "#4F46E5", borderTopColor: "transparent" }} />
          </div>
        )}

        {submitError && (
          <p className="text-sm text-destructive text-center">{submitError}</p>
        )}

        {/* Answer overview */}
        {questions.length > 0 && (
          <div className="bg-white rounded-xl border border-border p-4">
            <p className="text-xs font-medium text-muted mb-3">Respuestas ({answered}/{questions.length})</p>
            <div className="flex flex-wrap gap-1.5">
              {questions.map((question, idx) => (
                <button
                  key={question.id}
                  onClick={() => setCurrentQ(idx)}
                  className="h-8 w-8 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  style={
                    answers[question.id] !== undefined
                      ? { background: "#4F46E5", color: "#fff" }
                      : idx === currentQ
                      ? { background: "#F3F4F6", color: "#4F46E5", border: "1px solid #4F46E5" }
                      : { background: "#F3F4F6", color: "#6B7280" }
                  }
                >
                  {idx + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

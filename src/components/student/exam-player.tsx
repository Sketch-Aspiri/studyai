"use client"

import { useState } from "react"

export interface ExamQuestion {
  id: string
  question: string
  options: string[]
  correct_index: number
  explanation: string
}

export interface ExamData {
  questions: ExamQuestion[]
}

interface ExamPlayerProps {
  content: ExamData
  accentColor?: string
}

export function ExamPlayer({ content, accentColor = "var(--primary)" }: ExamPlayerProps) {
  const { questions } = content
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
  const [revealed, setRevealed] = useState<Set<string>>(new Set())
  const [view, setView] = useState<"exam" | "results">("exam")

  const current = questions[currentIndex]
  const isRevealed = current ? revealed.has(current.id) : false
  const selectedIndex = current ? selectedAnswers[current.id] : undefined
  const isLast = currentIndex === questions.length - 1

  function handleSelect(optionIndex: number) {
    if (!current || isRevealed) return
    setSelectedAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
    setRevealed((prev) => new Set(prev).add(current.id))
  }

  function handleNext() {
    if (!isLast) {
      setCurrentIndex((i) => i + 1)
    } else {
      setView("results")
    }
  }

  const correctCount = questions.filter(
    (q) => selectedAnswers[q.id] === q.correct_index
  ).length

  const scorePercent = Math.round((correctCount / questions.length) * 100)

  if (view === "results") {
    return (
      <div className="space-y-6">
        {/* Score header */}
        <div className="text-center py-6">
          <p className="text-5xl font-bold text-foreground">{scorePercent}%</p>
          <p className="text-muted mt-1">
            {correctCount} de {questions.length} correctas
          </p>
          <div className="mt-4 mx-auto max-w-xs h-2 rounded-full bg-border overflow-hidden">
            <div
              className="h-2 rounded-full transition-all"
              style={{
                width: `${scorePercent}%`,
                background:
                  scorePercent >= 70
                    ? "var(--success)"
                    : scorePercent >= 50
                    ? "var(--warning)"
                    : "var(--destructive)",
              }}
            />
          </div>
        </div>

        {/* Question review */}
        <div className="space-y-4">
          {questions.map((q, i) => {
            const userAnswer = selectedAnswers[q.id]
            const isCorrect = userAnswer === q.correct_index
            return (
              <div
                key={q.id}
                className="rounded-[--radius-md] border p-4 space-y-3"
                style={{ borderColor: isCorrect ? "var(--success)" : "var(--destructive)" }}
              >
                <div className="flex items-start gap-2">
                  <span
                    className="mt-0.5 flex-shrink-0 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: isCorrect ? "var(--success)" : "var(--destructive)" }}
                  >
                    {isCorrect ? "✓" : "✗"}
                  </span>
                  <p className="text-sm font-medium text-foreground">
                    {i + 1}. {q.question}
                  </p>
                </div>
                <div className="pl-7 space-y-1">
                  {q.options.map((opt, oi) => (
                    <p
                      key={oi}
                      className="text-xs px-2 py-1 rounded"
                      style={{
                        background:
                          oi === q.correct_index
                            ? "color-mix(in srgb, var(--success) 10%, transparent)"
                            : oi === userAnswer && !isCorrect
                            ? "color-mix(in srgb, var(--destructive) 8%, transparent)"
                            : "transparent",
                        color:
                          oi === q.correct_index
                            ? "var(--success)"
                            : oi === userAnswer && !isCorrect
                            ? "var(--destructive)"
                            : "var(--muted)",
                        fontWeight: oi === q.correct_index ? 600 : 400,
                      }}
                    >
                      {opt}
                    </p>
                  ))}
                  <p className="text-xs text-muted italic pt-1">{q.explanation}</p>
                </div>
              </div>
            )
          })}
        </div>

        <button
          onClick={() => {
            setView("exam")
            setCurrentIndex(0)
            setSelectedAnswers({})
            setRevealed(new Set())
          }}
          className="w-full rounded-[--radius-sm] border border-border py-2 text-sm font-medium text-muted hover:text-foreground transition-colors"
        >
          Reintentar examen
        </button>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="space-y-5">
      {/* Progress */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted">
          Pregunta {currentIndex + 1} de {questions.length}
        </p>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-5 rounded-full transition-colors"
              style={{
                background:
                  i < currentIndex
                    ? selectedAnswers[questions[i].id] === questions[i].correct_index
                      ? "var(--success)"
                      : "var(--destructive)"
                    : i === currentIndex
                    ? accentColor
                    : "var(--border)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-sm font-semibold text-foreground leading-relaxed">{current.question}</p>

      {/* Options */}
      <div className="space-y-2">
        {current.options.map((opt, oi) => {
          const isSelected = selectedIndex === oi
          const isCorrectOpt = oi === current.correct_index
          let bgStyle: React.CSSProperties = {}
          let borderColor = "var(--border)"

          if (isRevealed) {
            if (isCorrectOpt) {
              bgStyle = { background: "color-mix(in srgb, var(--success) 10%, white)" }
              borderColor = "var(--success)"
            } else if (isSelected) {
              bgStyle = { background: "color-mix(in srgb, var(--destructive) 8%, white)" }
              borderColor = "var(--destructive)"
            }
          } else if (isSelected) {
            bgStyle = { background: "color-mix(in srgb, var(--primary) 8%, white)" }
            borderColor = accentColor
          }

          return (
            <button
              key={oi}
              onClick={() => handleSelect(oi)}
              disabled={isRevealed}
              className="w-full text-left rounded-[--radius-sm] border px-4 py-3 text-sm transition-colors disabled:cursor-default"
              style={{ borderColor, ...bgStyle }}
            >
              <span
                className="font-medium mr-2"
                style={{
                  color: isRevealed
                    ? isCorrectOpt
                      ? "var(--success)"
                      : isSelected
                      ? "var(--destructive)"
                      : "var(--muted)"
                    : "var(--muted)",
                }}
              >
                {["A", "B", "C", "D"][oi]})
              </span>
              {opt.replace(/^[A-D]\)\s*/, "")}
            </button>
          )
        })}
      </div>

      {/* Explanation */}
      {isRevealed && (
        <div
          className="rounded-[--radius-sm] px-4 py-3 text-xs"
          style={{
            background:
              selectedIndex === current.correct_index
                ? "color-mix(in srgb, var(--success) 8%, white)"
                : "color-mix(in srgb, var(--destructive) 6%, white)",
            color: "var(--foreground)",
          }}
        >
          <span className="font-semibold">
            {selectedIndex === current.correct_index ? "✓ Correcto — " : "✗ Incorrecto — "}
          </span>
          {current.explanation}
        </div>
      )}

      {/* Next button */}
      {isRevealed && (
        <button
          onClick={handleNext}
          className="w-full rounded-[--radius-sm] py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
          style={{ background: accentColor }}
        >
          {isLast ? "Ver resultados" : "Siguiente →"}
        </button>
      )}
    </div>
  )
}

"use client"

import { useMemo, useState } from "react"

export interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
}

export interface FlashcardsData {
  flashcards: Flashcard[]
}

interface FlashcardDeckProps {
  content: FlashcardsData
  accentColor?: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

export function FlashcardDeck({ content, accentColor = "var(--primary)" }: FlashcardDeckProps) {
  const { flashcards } = content
  const [mode, setMode] = useState<"grid" | "study">("grid")
  const [shuffled, setShuffled] = useState(false)
  const [shuffledOrder, setShuffledOrder] = useState<number[]>([])
  const [flipped, setFlipped] = useState<Set<number>>(new Set())
  const [learned, setLearned] = useState<Set<number>>(new Set())
  const [review, setReview] = useState<Set<number>>(new Set())
  const [currentIndex, setCurrentIndex] = useState(0)

  const order = useMemo(
    () => (shuffled ? shuffledOrder : flashcards.map((_, i) => i)),
    [shuffled, shuffledOrder, flashcards]
  )

  const categories = useMemo(
    () => [...new Set(flashcards.map((f) => f.category).filter(Boolean))],
    [flashcards]
  )

  function toggleShuffle() {
    if (!shuffled) {
      setShuffledOrder(shuffleArray(flashcards.map((_, i) => i)))
      setCurrentIndex(0)
      setFlipped(new Set())
    }
    setShuffled((v) => !v)
  }

  function toggleFlip(index: number) {
    setFlipped((prev) => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function markLearned(index: number) {
    setLearned((prev) => new Set(prev).add(index))
    setReview((prev) => { const s = new Set(prev); s.delete(index); return s })
  }

  function markReview(index: number) {
    setReview((prev) => new Set(prev).add(index))
    setLearned((prev) => { const s = new Set(prev); s.delete(index); return s })
  }

  function enterStudy() {
    setMode("study")
    setCurrentIndex(0)
    setFlipped(new Set())
  }

  function exitStudy() {
    setMode("grid")
    setFlipped(new Set())
  }

  // ── Study mode ──────────────────────────────────────────────────────────
  if (mode === "study") {
    const cardIndex = order[currentIndex]
    const card = flashcards[cardIndex]
    const isFlipped = flipped.has(cardIndex)
    const isLearned = learned.has(cardIndex)
    const isReview = review.has(cardIndex)
    const isLast = currentIndex === order.length - 1

    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={exitStudy} className="text-xs text-muted hover:text-foreground transition-colors flex items-center gap-1">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver al grid
          </button>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{currentIndex + 1} / {order.length}</span>
            <button
              onClick={toggleShuffle}
              className={`text-xs px-2 py-1 rounded-[--radius-sm] border transition-colors ${shuffled ? "border-transparent text-white" : "border-border text-muted hover:text-foreground"}`}
              style={shuffled ? { background: accentColor } : undefined}
            >
              ⇄ Mezclar
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full bg-border overflow-hidden">
          <div
            className="h-1 rounded-full transition-all"
            style={{ width: `${((currentIndex + 1) / order.length) * 100}%`, background: accentColor }}
          />
        </div>

        {/* Card */}
        {card.category && (
          <p className="text-xs font-medium text-muted text-center">{card.category}</p>
        )}
        <div className="flashcard-scene" style={{ height: 220 }} onClick={() => toggleFlip(cardIndex)}>
          <div className={`flashcard-card cursor-pointer ${isFlipped ? "is-flipped" : ""}`}>
            {/* Front */}
            <div className="flashcard-face rounded-[--radius-md] border border-border bg-white flex items-center justify-center p-6 text-center shadow-sm">
              <p className="text-sm font-medium text-foreground">{card.front}</p>
            </div>
            {/* Back */}
            <div className="flashcard-face flashcard-face--back rounded-[--radius-md] border flex items-center justify-center p-6 text-center shadow-sm" style={{ background: accentColor, borderColor: accentColor }}>
              <p className="text-sm text-white">{card.back}</p>
            </div>
          </div>
        </div>
        <p className="text-xs text-muted text-center">Haz clic en la tarjeta para voltear</p>

        {/* Mark buttons */}
        <div className="flex gap-2">
          <button
            onClick={() => markReview(cardIndex)}
            className={`flex-1 py-2 rounded-[--radius-sm] border text-xs font-medium transition-colors ${isReview ? "border-warning bg-warning/10 text-warning" : "border-border text-muted hover:border-warning hover:text-warning"}`}
          >
            ↩ Repasar
          </button>
          <button
            onClick={() => markLearned(cardIndex)}
            className={`flex-1 py-2 rounded-[--radius-sm] border text-xs font-medium transition-colors ${isLearned ? "border-success bg-success/10 text-success" : "border-border text-muted hover:border-success hover:text-success"}`}
          >
            ✓ Aprendida
          </button>
        </div>

        {/* Navigation */}
        <div className="flex gap-2">
          <button
            onClick={() => { setCurrentIndex((i) => i - 1); setFlipped(new Set()) }}
            disabled={currentIndex === 0}
            className="flex-1 py-2 rounded-[--radius-sm] border border-border text-xs font-medium text-muted hover:text-foreground disabled:opacity-40 transition-colors"
          >
            ← Anterior
          </button>
          {!isLast ? (
            <button
              onClick={() => { setCurrentIndex((i) => i + 1); setFlipped(new Set()) }}
              className="flex-1 py-2 rounded-[--radius-sm] text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: accentColor }}
            >
              Siguiente →
            </button>
          ) : (
            <button
              onClick={exitStudy}
              className="flex-1 py-2 rounded-[--radius-sm] text-xs font-medium text-white transition-opacity hover:opacity-90"
              style={{ background: accentColor }}
            >
              Finalizar ✓
            </button>
          )}
        </div>

        {/* Stats */}
        {(learned.size > 0 || review.size > 0) && (
          <div className="flex gap-3 justify-center text-xs">
            {learned.size > 0 && <span className="text-success">✓ {learned.size} aprendidas</span>}
            {review.size > 0 && <span className="text-warning">↩ {review.size} a repasar</span>}
          </div>
        )}
      </div>
    )
  }

  // ── Grid mode ────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted">{flashcards.length} tarjetas</span>
          {categories.length > 0 && (
            <span className="text-xs text-muted">· {categories.length} categorías</span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={toggleShuffle}
            className={`text-xs px-2.5 py-1.5 rounded-[--radius-sm] border transition-colors ${shuffled ? "border-transparent text-white" : "border-border text-muted hover:text-foreground"}`}
            style={shuffled ? { background: accentColor } : undefined}
          >
            ⇄ Mezclar
          </button>
          <button
            onClick={enterStudy}
            className="text-xs px-2.5 py-1.5 rounded-[--radius-sm] text-white transition-opacity hover:opacity-90"
            style={{ background: accentColor }}
          >
            ▶ Modo estudio
          </button>
        </div>
      </div>

      {/* Stats */}
      {(learned.size > 0 || review.size > 0) && (
        <div className="flex gap-3 text-xs">
          {learned.size > 0 && <span className="text-success">✓ {learned.size} aprendidas</span>}
          {review.size > 0 && <span className="text-warning">↩ {review.size} a repasar</span>}
          <span className="text-muted">· {flashcards.length - learned.size - review.size} sin marcar</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {order.map((cardIndex) => {
          const card = flashcards[cardIndex]
          const isFlipped = flipped.has(cardIndex)
          const isLearned = learned.has(cardIndex)
          const isReview = review.has(cardIndex)

          return (
            <div key={card.id} className="space-y-1">
              <div
                className="flashcard-scene cursor-pointer"
                style={{ height: 140 }}
                onClick={() => toggleFlip(cardIndex)}
              >
                <div className={`flashcard-card ${isFlipped ? "is-flipped" : ""}`}>
                  {/* Front */}
                  <div
                    className="flashcard-face rounded-[--radius-md] border flex flex-col items-center justify-center p-4 text-center shadow-sm"
                    style={{
                      borderColor: isLearned ? "var(--success)" : isReview ? "var(--warning)" : "var(--border)",
                      background: isLearned ? "color-mix(in srgb, var(--success) 5%, white)" : "white",
                    }}
                  >
                    {card.category && (
                      <span className="text-[10px] font-medium text-muted mb-1.5">{card.category}</span>
                    )}
                    <p className="text-xs font-medium text-foreground line-clamp-4">{card.front}</p>
                  </div>
                  {/* Back */}
                  <div
                    className="flashcard-face flashcard-face--back rounded-[--radius-md] border flex items-center justify-center p-4 text-center shadow-sm"
                    style={{ background: accentColor, borderColor: accentColor }}
                  >
                    <p className="text-xs text-white line-clamp-5">{card.back}</p>
                  </div>
                </div>
              </div>

              {/* Mark buttons — only show when flipped */}
              {isFlipped && (
                <div className="flex gap-1">
                  <button
                    onClick={(e) => { e.stopPropagation(); markReview(cardIndex) }}
                    className={`flex-1 py-1 rounded text-[10px] font-medium border transition-colors ${isReview ? "border-warning bg-warning/10 text-warning" : "border-border text-muted hover:text-warning"}`}
                  >
                    ↩ Repasar
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); markLearned(cardIndex) }}
                    className={`flex-1 py-1 rounded text-[10px] font-medium border transition-colors ${isLearned ? "border-success bg-success/10 text-success" : "border-border text-muted hover:text-success"}`}
                  >
                    ✓ Aprendida
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

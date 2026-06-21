import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { FlashCard as FlashCardType } from '@/types'

interface FlashCardProps {
  card: FlashCardType
  onKnow?: () => void
  onReview?: () => void
  showActions?: boolean
}

export function FlashCard({ card, onKnow, onReview, showActions = false }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false)

  const handleFlip = () => setFlipped((prev) => !prev)

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div
        className="flashcard-container w-full cursor-pointer"
        style={{ height: '320px' }}
        onClick={handleFlip}
      >
        <div className={cn('flashcard-inner', { flipped })}>
          {/* Front */}
          <div className="flashcard-front bg-white border border-gray-200 shadow-md flex flex-col items-center justify-center p-8">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-4">
              Pregunta
            </p>
            <p className="text-xl font-semibold text-gray-900 text-center leading-relaxed">
              {card.front}
            </p>
            <p className="text-sm text-gray-400 mt-6">Toca para ver la respuesta</p>
          </div>

          {/* Back */}
          <div className="flashcard-back bg-indigo-50 border border-indigo-200 shadow-md flex flex-col items-center justify-center p-8">
            <p className="text-xs font-medium text-indigo-500 uppercase tracking-wider mb-4">
              Respuesta
            </p>
            <p className="text-lg text-gray-800 text-center leading-relaxed">{card.back}</p>
          </div>
        </div>
      </div>

      {showActions && flipped && (
        <div className="flex gap-4 w-full max-w-sm">
          <button
            onClick={onReview}
            className="flex-1 h-12 rounded-lg border-2 border-yellow-400 bg-yellow-50 text-yellow-700 font-medium hover:bg-yellow-100 transition-colors"
          >
            Repasar
          </button>
          <button
            onClick={onKnow}
            className="flex-1 h-12 rounded-lg border-2 border-green-400 bg-green-50 text-green-700 font-medium hover:bg-green-100 transition-colors"
          >
            Lo sé
          </button>
        </div>
      )}

      {showActions && !flipped && (
        <div className="flex gap-4 w-full max-w-sm">
          <div className="flex-1 h-12 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-sm text-gray-400">
            Voltea la carta primero
          </div>
        </div>
      )}
    </div>
  )
}

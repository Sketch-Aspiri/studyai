import { useState, useCallback } from 'react'
import type { FlashCard } from '@/types'

interface StudyStats {
  known: number
  review: number
  total: number
}

export function useStudySession(cards: FlashCard[]) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [results, setResults] = useState<FlashCard[]>([])
  const [finished, setFinished] = useState(false)

  const currentCard = cards[currentIndex]

  const flip = useCallback(() => {
    setIsFlipped((prev) => !prev)
  }, [])

  const answer = useCallback(
    (status: 'known' | 'review') => {
      const updated = { ...currentCard, status }
      setResults((prev) => [...prev, updated])

      if (currentIndex + 1 >= cards.length) {
        setFinished(true)
      } else {
        setCurrentIndex((prev) => prev + 1)
        setIsFlipped(false)
      }
    },
    [currentCard, currentIndex, cards.length]
  )

  const restart = useCallback(() => {
    setCurrentIndex(0)
    setIsFlipped(false)
    setResults([])
    setFinished(false)
  }, [])

  const stats: StudyStats = {
    known: results.filter((c) => c.status === 'known').length,
    review: results.filter((c) => c.status === 'review').length,
    total: cards.length,
  }

  return {
    currentCard,
    currentIndex,
    isFlipped,
    finished,
    stats,
    flip,
    answer,
    restart,
  }
}

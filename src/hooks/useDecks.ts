import { useState, useCallback } from 'react'
import type { Deck } from '@/types'
import {
  getDecks,
  saveDeck,
  deleteDeck as removeDeck,
} from '@/services/storageService'

export function useDecks() {
  const [decks, setDecks] = useState<Deck[]>(() => getDecks())

  const addDeck = useCallback((deck: Deck) => {
    saveDeck(deck)
    setDecks(getDecks())
  }, [])

  const removeDeckById = useCallback((id: string) => {
    removeDeck(id)
    setDecks(getDecks())
  }, [])

  const refresh = useCallback(() => {
    setDecks(getDecks())
  }, [])

  return { decks, addDeck, removeDeckById, refresh }
}

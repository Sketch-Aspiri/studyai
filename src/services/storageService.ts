import type { Deck, Settings } from '@/types'

const DECKS_KEY = 'flashcards_decks'
const SETTINGS_KEY = 'flashcards_settings'

const DEFAULT_SETTINGS: Settings = {
  apiKey: '',
  defaultCardCount: 20,
}

export function getDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY)
    return raw ? (JSON.parse(raw) as Deck[]) : []
  } catch {
    return []
  }
}

export function saveDeck(deck: Deck): void {
  const decks = getDecks()
  const existing = decks.findIndex((d) => d.id === deck.id)
  const updated =
    existing >= 0
      ? decks.map((d) => (d.id === deck.id ? deck : d))
      : [deck, ...decks]
  localStorage.setItem(DECKS_KEY, JSON.stringify(updated))
}

export function deleteDeck(id: string): void {
  const decks = getDecks().filter((d) => d.id !== id)
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks))
}

export function getDeckById(id: string): Deck | undefined {
  return getDecks().find((d) => d.id === id)
}

export function getSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<Settings>) }
      : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

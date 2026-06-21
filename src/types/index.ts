export type CardStatus = 'new' | 'known' | 'review'

export interface FlashCard {
  id: string
  front: string
  back: string
  status: CardStatus
}

export interface Deck {
  id: string
  name: string
  createdAt: string
  cards: FlashCard[]
  cardCount: number
}

export interface Settings {
  apiKey: string
  defaultCardCount: number
}

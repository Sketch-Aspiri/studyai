export type UserRole = "STUDENT" | "TEACHER"
export type SubscriptionStatus = "FREE" | "PRO" | "CANCELED"
export type FileType = "PDF" | "DOCX" | "PPTX" | "TXT"
export type ProcessingStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
export type ResourceType = "SUMMARY" | "CONCEPT_MAP" | "EXAM" | "FLASHCARDS"

export interface ConceptMapData {
  nodes: { id: string; label: string; type: "main" | "sub" | "detail" }[]
  edges: { source: string; target: string; label: string }[]
}

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

export interface Flashcard {
  id: string
  front: string
  back: string
  category?: string
}

export interface FlashcardsData {
  flashcards: Flashcard[]
}

export type ResourceContent = string | ConceptMapData | ExamData | FlashcardsData

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { UploadZone } from '@/components/UploadZone'
import { GeneratingLoader } from '@/components/GeneratingLoader'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { extractTextFromPDF } from '@/services/pdfService'
import { generateFlashcards } from '@/services/claudeService'
import { getSettings, saveDeck } from '@/services/storageService'
import type { Deck } from '@/types'

type Phase = 'idle' | 'reading' | 'generating'

export function UploadPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [cardCount, setCardCount] = useState(() => getSettings().defaultCardCount)
  const [phase, setPhase] = useState<Phase>('idle')

  const handleGenerate = async () => {
    if (!file) return

    const { apiKey } = getSettings()
    if (!apiKey) {
      showToast('Configura tu API key primero en Ajustes', 'error')
      navigate('/settings')
      return
    }

    try {
      setPhase('reading')
      const text = await extractTextFromPDF(file)

      setPhase('generating')
      const cards = await generateFlashcards(text, cardCount, apiKey)

      const deck: Deck = {
        id: crypto.randomUUID(),
        name: file.name.replace(/\.pdf$/i, ''),
        createdAt: new Date().toISOString(),
        cards,
        cardCount: cards.length,
      }

      saveDeck(deck)
      showToast(`¡${cards.length} flashcards generadas!`)
      navigate(`/deck/${deck.id}`)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ocurrió un error inesperado'
      showToast(msg, 'error')
      setPhase('idle')
    }
  }

  if (phase !== 'idle') {
    return (
      <div className="max-w-lg mx-auto py-10 px-4">
        <GeneratingLoader phase={phase} />
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Nuevo mazo</h1>
      <p className="text-gray-500 text-sm mb-8">
        Sube un PDF y Claude generará las flashcards automáticamente.
      </p>

      <div className="space-y-6">
        <UploadZone file={file} onFile={setFile} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad de flashcards
          </label>
          <div className="flex gap-2">
            {[10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setCardCount(n)}
                className={`flex-1 h-10 rounded-lg border text-sm font-medium transition-colors ${
                  cardCount === n
                    ? 'bg-indigo-500 text-white border-indigo-500'
                    : 'border-gray-200 text-gray-600 hover:border-indigo-300'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          onClick={handleGenerate}
          disabled={!file}
          size="lg"
          className="w-full"
        >
          Generar {cardCount} flashcards
        </Button>
      </div>
    </div>
  )
}

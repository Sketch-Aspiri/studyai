import { useNavigate } from 'react-router-dom'
import { Plus, BookOpen } from 'lucide-react'
import { DeckCard } from '@/components/DeckCard'
import { Button } from '@/components/ui/Button'
import { useDecks } from '@/hooks/useDecks'

export function HomePage() {
  const navigate = useNavigate()
  const { decks, removeDeckById } = useDecks()

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mis mazos</h1>
          <p className="text-gray-500 text-sm mt-1">
            {decks.length === 0
              ? 'No tienes mazos todavía'
              : `${decks.length} mazo${decks.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Button onClick={() => navigate('/upload')}>
          <Plus size={16} className="mr-2" />
          Nuevo mazo
        </Button>
      </div>

      {decks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
            <BookOpen size={32} className="text-indigo-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Sube tu primer PDF
          </h2>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Carga cualquier PDF de estudio y Claude generará flashcards
            automáticamente.
          </p>
          <Button onClick={() => navigate('/upload')}>
            <Plus size={16} className="mr-2" />
            Crear mazo
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {decks.map((deck) => (
            <DeckCard key={deck.id} deck={deck} onDelete={removeDeckById} />
          ))}
        </div>
      )}
    </div>
  )
}

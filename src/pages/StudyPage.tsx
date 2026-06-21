import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, CheckCircle } from 'lucide-react'
import { FlashCard } from '@/components/FlashCard'
import { StudyProgress } from '@/components/StudyProgress'
import { Button } from '@/components/ui/Button'
import { useStudySession } from '@/hooks/useStudySession'
import { getDeckById } from '@/services/storageService'

export function StudyPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const deck = id ? getDeckById(id) : undefined

  const { currentCard, currentIndex, finished, stats, answer, restart } =
    useStudySession(deck?.cards ?? [])

  if (!deck) {
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <p className="text-gray-500">Mazo no encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Volver al inicio
        </Button>
      </div>
    )
  }

  if (finished) {
    const knownPct = stats.total > 0 ? Math.round((stats.known / stats.total) * 100) : 0
    return (
      <div className="max-w-lg mx-auto py-20 px-4 text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">¡Sesión completada!</h1>
        <p className="text-gray-500 mb-8">Estudiaste {stats.total} flashcards</p>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-3xl font-bold text-green-600">{stats.known}</p>
            <p className="text-sm text-green-700 mt-1">Lo sé</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <p className="text-3xl font-bold text-yellow-600">{stats.review}</p>
            <p className="text-sm text-yellow-700 mt-1">Repasar</p>
          </div>
        </div>

        <p className="text-sm text-gray-400 mb-6">Dominio: {knownPct}%</p>

        <div className="flex flex-col gap-3">
          <Button onClick={restart} size="lg">
            <RotateCcw size={16} className="mr-2" /> Repetir sesión
          </Button>
          <Button variant="ghost" onClick={() => navigate(`/deck/${deck.id}`)}>
            Ver todas las cards
          </Button>
          <Button variant="ghost" onClick={() => navigate('/')}>
            Ir al inicio
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto py-10 px-4">
      <button
        onClick={() => navigate(`/deck/${deck.id}`)}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft size={14} /> {deck.name}
      </button>

      <div className="mb-8">
        <StudyProgress current={currentIndex} total={stats.total} />
      </div>

      {currentCard && (
        <FlashCard
          card={currentCard}
          showActions
          onKnow={() => answer('known')}
          onReview={() => answer('review')}
        />
      )}
    </div>
  )
}

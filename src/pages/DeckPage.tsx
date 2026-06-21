import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BookOpen, ArrowLeft, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/Dialog'
import { useToast } from '@/components/ui/Toast'
import { getDeckById, deleteDeck } from '@/services/storageService'
import { truncateText } from '@/lib/utils'

export function DeckPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [selected, setSelected] = useState<{ front: string; back: string } | null>(null)

  const deck = id ? getDeckById(id) : undefined

  if (!deck) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4 text-center">
        <p className="text-gray-500">Mazo no encontrado.</p>
        <Button variant="ghost" onClick={() => navigate('/')} className="mt-4">
          Volver al inicio
        </Button>
      </div>
    )
  }

  const handleDelete = () => {
    deleteDeck(deck.id)
    showToast('Mazo eliminado')
    navigate('/')
  }

  return (
    <>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
        >
          <ArrowLeft size={14} /> Volver
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{deck.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge>{deck.cardCount} cards</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={14} className="mr-1" /> Eliminar
            </Button>
            <Button onClick={() => navigate(`/deck/${deck.id}/study`)}>
              <BookOpen size={14} className="mr-2" /> Estudiar
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {deck.cards.map((card, i) => (
            <button
              key={card.id}
              onClick={() => setSelected({ front: card.front, back: card.back })}
              className="bg-white border border-gray-200 rounded-xl p-4 text-left hover:shadow-md transition-shadow hover:border-indigo-200"
            >
              <p className="text-xs text-indigo-500 font-medium mb-1">#{i + 1}</p>
              <p className="text-sm font-medium text-gray-900 leading-snug">
                {truncateText(card.front, 80)}
              </p>
            </button>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        {selected && (
          <DialogContent title={selected.front}>
            <div className="mt-2 p-4 bg-indigo-50 rounded-lg">
              <p className="text-xs font-medium text-indigo-500 mb-2 uppercase tracking-wide">
                Respuesta
              </p>
              <p className="text-sm text-gray-800 leading-relaxed">{selected.back}</p>
            </div>
          </DialogContent>
        )}
      </Dialog>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          title="Eliminar mazo"
          description={`¿Eliminar "${deck.name}"? Esta acción no se puede deshacer.`}
        >
          <div className="flex gap-3 justify-end mt-4">
            <DialogClose asChild>
              <Button variant="secondary" size="sm">Cancelar</Button>
            </DialogClose>
            <Button variant="destructive" size="sm" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

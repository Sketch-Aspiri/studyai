import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Trash2, MoreVertical, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Dialog, DialogContent, DialogClose } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils'
import type { Deck } from '@/types'

interface DeckCardProps {
  deck: Deck
  onDelete: (id: string) => void
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate text-sm">{deck.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{formatDate(deck.createdAt)}</p>
            </div>
            <div className="relative">
              <button
                onClick={() => setMenuOpen((p) => !p)}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <MoreVertical size={16} />
              </button>
              {menuOpen && (
                <div
                  className="absolute right-0 top-7 z-10 bg-white border border-gray-200 rounded-lg shadow-lg py-1 w-36"
                  onMouseLeave={() => setMenuOpen(false)}
                >
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/deck/${deck.id}/study`) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <BookOpen size={14} /> Estudiar
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); navigate(`/deck/${deck.id}`) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye size={14} /> Ver cards
                  </button>
                  <button
                    onClick={() => { setMenuOpen(false); setConfirmOpen(true) }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> Eliminar
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <Badge>{deck.cardCount} cards</Badge>
            <button
              onClick={() => navigate(`/deck/${deck.id}/study`)}
              className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
            >
              Estudiar →
            </button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent
          title="Eliminar mazo"
          description={`¿Eliminar "${deck.name}"? Esta acción no se puede deshacer.`}
        >
          <div className="flex gap-3 justify-end mt-4">
            <DialogClose asChild>
              <Button variant="secondary" size="sm">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => { onDelete(deck.id); setConfirmOpen(false) }}
            >
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

'use client'
import { useState } from 'react'
import Image from 'next/image'
import { XIcon, PlusIcon } from 'lucide-react'
import { card } from '@/app/_cards/repo'

const DREAM_GARAGE_SIZE = 5

const ratingBadgeClass: Record<string, string> = {
  'S+': 'bg-amber-400 text-primary',
  S: 'bg-[#FF70A6] text-white',
  A: 'bg-[#ff9770] text-primary',
  B: 'bg-[#5d536b] text-white',
  C: 'bg-[#272838] text-white'
}

const ratingStripeClass: Record<string, string> = {
  'S+': 'bg-amber-400',
  S: 'bg-[#FF70A6]',
  A: 'bg-[#ff9770]',
  B: 'bg-[#5d536b]',
  C: 'bg-[#272838]'
}

type DreamGarageSectionProps = {
  dreamCards: card[]
  onRemove: (cardId: number) => void
  onReorder: (newCardIds: number[]) => void
  onCardClick: (cardId: number) => void
}

export function DreamGarageSection({
  dreamCards,
  onRemove,
  onReorder,
  onCardClick
}: DreamGarageSectionProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  function handleDragStart(index: number) {
    setDragIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    setDragOverIndex(index)
  }

  function handleDrop(dropIndex: number) {
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null)
      setDragOverIndex(null)
      return
    }
    const reordered = [...dreamCards]
    const [moved] = reordered.splice(dragIndex, 1)
    reordered.splice(dropIndex, 0, moved)
    onReorder(reordered.map((c) => c.id))
    setDragIndex(null)
    setDragOverIndex(null)
  }

  function handleDragEnd() {
    setDragIndex(null)
    setDragOverIndex(null)
  }

  const emptySlots = DREAM_GARAGE_SIZE - dreamCards.length

  return (
    <div className="py-10 mb-4 -mx-4 px-4 sm:-mx-8 sm:px-8 bg-gradient-to-b from-muted/60 to-transparent">
      <div className="flex gap-4 justify-center flex-wrap sm:flex-nowrap">
        {dreamCards.map((card, index) => (
          <div
            key={card.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={() => handleDrop(index)}
            onDragEnd={handleDragEnd}
            className={`relative shrink-0 group/dream transition-all duration-150 ${dragOverIndex === index && dragIndex !== index ? 'scale-105 -translate-y-2' : ''} ${dragIndex === index ? 'opacity-50' : ''}`}
            style={{ width: 160 }}
          >
            <span
              className={`absolute -top-3 -right-3 z-10 h-9 w-9 flex items-center justify-center text-sm font-bold rounded-full shadow-md ${ratingBadgeClass[card.rating] ?? 'bg-muted text-foreground'}`}
            >
              {card.rating}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onRemove(card.id)
              }}
              className="absolute -top-3 -left-3 z-10 h-7 w-7 flex items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover/dream:opacity-100 transition-opacity shadow-md hover:bg-destructive/80"
              aria-label={`Remove ${card.name}`}
            >
              <XIcon size={14} />
            </button>
            <div
              className="relative w-full overflow-hidden rounded-2xl shadow-xl cursor-grab active:cursor-grabbing hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-200"
              style={{ aspectRatio: '5/7' }}
              onClick={() => onCardClick(card.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
              <div
                className={`absolute top-0 inset-x-0 h-1.5 ${ratingStripeClass[card.rating] ?? 'bg-muted'}`}
              />

              <div className="absolute top-1.5 inset-x-0 bg-black/55 px-3 py-2">
                <span className="text-white font-semibold truncate block text-center text-xs">
                  {card.name}
                </span>
              </div>

              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0 opacity-0 group-hover/dream:opacity-100 transition-opacity duration-300 pointer-events-none" />

              <div className="absolute inset-0 flex items-center justify-center p-3 pt-12 pb-3">
                <Image
                  src={card.image}
                  width={280}
                  height={280}
                  alt={card.name}
                  style={{
                    objectFit: 'contain',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    height: 'auto'
                  }}
                  className="drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        ))}
        {Array.from({ length: emptySlots }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="shrink-0 rounded-2xl border-2 border-dashed border-border/40 flex flex-col items-center justify-center gap-2 text-muted-foreground/30"
            style={{ width: 160, aspectRatio: '5/7' }}
          >
            <PlusIcon size={32} strokeWidth={1.5} />
            <span className="text-xs">Empty</span>
          </div>
        ))}
      </div>

      {dreamCards.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-6">
          Open any card you own and tap &ldquo;Add to Dream Garage&rdquo;.
        </p>
      )}
    </div>
  )
}

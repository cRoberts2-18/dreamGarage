'use client'
import { useState, useMemo } from 'react'
import Image from 'next/image'
import { RefreshCwIcon, SearchIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { card } from '@/app/_cards/repo'
import { RaceEvent, Opponent } from '@/app/_events/repo'
import { Stage } from '@/lib/raceEngine'
import { TrackMap } from '@/components/race/TrackMap'

type Props = {
  event: RaceEvent
  stage: Stage | null
  opponent: Opponent | null
  shuffling: boolean
  onShuffle: () => void
  allCards: card[]
  ownedCardIds: number[]
  selectedCar: card | null
  onSelectCar: (car: card) => void
  onRace: () => void
  onBack: () => void
}

const ratingBadgeClass: Record<string, string> = {
  'S+': 'bg-amber-400 text-primary',
  S: 'bg-[#FF70A6] text-white',
  A: 'bg-[#ff9770] text-primary',
  B: 'bg-[#5d536b] text-white',
  C: 'bg-[#272838] text-white',
}

const ratingStripeClass: Record<string, string> = {
  'S+': 'bg-amber-400',
  S: 'bg-[#FF70A6]',
  A: 'bg-[#ff9770]',
  B: 'bg-[#5d536b]',
  C: 'bg-[#272838]',
}

const ALL_RATINGS = ['S+', 'S', 'A', 'B', 'C']

const eventAccent: Record<string, string> = {
  drag: '#ff9770',
  circuit: '#FF70A6',
  rally: '#fbbf24',
}

function DifficultyStars({ difficulty }: { difficulty: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 w-5 rounded-full transition-colors ${i < difficulty ? 'bg-amber-400' : 'bg-border'}`}
        />
      ))}
    </div>
  )
}

function CarCard({ car, size = 'md' }: { car: card; size?: 'sm' | 'md' }) {
  const w = size === 'sm' ? 64 : 90
  const h = size === 'sm' ? 89 : 126
  return (
    <div className="relative" style={{ width: w }}>
      <span className={`absolute -top-2 -right-2 z-10 h-6 w-6 flex items-center justify-center text-[10px] font-bold rounded-full shadow ${ratingBadgeClass[car.rating] ?? 'bg-muted'}`}>
        {car.rating}
      </span>
      <div className="relative overflow-hidden rounded-xl shadow-md" style={{ width: w, height: h }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
        <div className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[car.rating] ?? 'bg-muted'}`} />
        <div className="absolute inset-0 flex items-center justify-center p-2 pt-4">
          <Image src={car.image} width={120} height={120} alt={car.name}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
            className="drop-shadow-lg" />
        </div>
      </div>
    </div>
  )
}

function StatPill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col items-center bg-muted/40 rounded-lg px-3 py-1.5 min-w-[60px]">
      <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</span>
      <span className="text-sm font-bold">{value}</span>
    </div>
  )
}

export function RaceSetup({
  event, stage, opponent, shuffling, onShuffle,
  allCards, ownedCardIds, selectedCar, onSelectCar, onRace, onBack,
}: Props) {
  const [showCarPicker, setShowCarPicker] = useState(false)
  const [search, setSearch] = useState('')
  const [ratingFilter, setRatingFilter] = useState<Set<string>>(new Set())

  const accent = eventAccent[event.type] ?? '#FF70A6'

  const toggleRating = (r: string) =>
    setRatingFilter(prev => {
      const next = new Set(prev)
      next.has(r) ? next.delete(r) : next.add(r)
      return next
    })

  const ownedUniqueCards = useMemo(() => {
    const owned = allCards.filter(c => ownedCardIds.includes(c.id))
    return owned.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
      const matchesRating = ratingFilter.size === 0 || ratingFilter.has(c.rating)
      return matchesSearch && matchesRating
    })
  }, [allCards, ownedCardIds, search, ratingFilter])

  return (
    <div className="flex flex-col gap-5 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
          ← Back
        </button>
        <p className="font-bold text-base">{event.name}</p>
      </div>

      {/* Track preview */}
      {stage && (
        <div className="bg-[#1a1b2e] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <span className="text-xs font-semibold text-white/50 uppercase tracking-wider">
              {stage.name}
              {stage.surface === 'dirt' && (
                <span className="ml-2 text-amber-400">· Dirt</span>
              )}
            </span>
          </div>
          <div className="flex justify-center py-2">
            <TrackMap stage={stage} accent={accent} width={320} height={140} />
          </div>
        </div>
      )}

      {/* Opponent panel */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Opponent</span>
          <button onClick={onShuffle} disabled={shuffling}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40">
            <RefreshCwIcon size={12} className={shuffling ? 'animate-spin' : ''} />
            Shuffle
          </button>
        </div>

        {opponent ? (
          <div className="flex items-start gap-4">
            <CarCard car={opponent.card} />
            <div className="flex flex-col gap-2 flex-1">
              <p className="font-bold text-sm leading-tight">{opponent.card.name}</p>
              <DifficultyStars difficulty={opponent.difficulty} />
              <div className="flex gap-2 flex-wrap mt-1">
                <StatPill label="Speed" value={opponent.card.topSpeed} />
                <StatPill label="HP" value={opponent.card.horsepower} />
                <StatPill label="Handling" value={`${opponent.card.handling}/5`} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">
            Loading opponent…
          </div>
        )}
      </div>

      {/* Your car panel */}
      <div className="bg-muted/30 border border-border rounded-xl p-4 flex flex-col gap-4">
        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Your Car</span>

        {selectedCar ? (
          <div className="flex items-start gap-4">
            <CarCard car={selectedCar} />
            <div className="flex flex-col gap-2 flex-1">
              <p className="font-bold text-sm leading-tight">{selectedCar.name}</p>
              <div className="flex gap-2 flex-wrap mt-1">
                <StatPill label="Speed" value={selectedCar.topSpeed} />
                <StatPill label="HP" value={selectedCar.horsepower} />
                <StatPill label="Handling" value={`${selectedCar.handling}/5`} />
              </div>
              <button onClick={() => setShowCarPicker(true)}
                className="text-xs text-primary hover:underline mt-1 text-left">
                Change car
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowCarPicker(true)}
            className="w-full py-6 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors text-sm">
            Pick your car
          </button>
        )}
      </div>

      <Button onClick={onRace} disabled={!selectedCar || !opponent} className="w-full py-6 text-base font-bold">
        Race!
      </Button>

      {/* Car picker modal */}
      <Modal showModal={showCarPicker} title="Choose Your Car" onClose={() => setShowCarPicker(false)}>
        <div className="flex flex-col gap-3">
          {/* Search */}
          <div className="relative">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search cars…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-border bg-muted/30 focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* Rating filters */}
          <div className="flex gap-2 flex-wrap">
            {ALL_RATINGS.map(r => (
              <button
                key={r}
                onClick={() => toggleRating(r)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                  ratingFilter.has(r)
                    ? `${ratingBadgeClass[r]} border-transparent`
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                {r}
              </button>
            ))}
            {ratingFilter.size > 0 && (
              <button onClick={() => setRatingFilter(new Set())}
                className="px-3 py-1 rounded-full text-xs text-muted-foreground hover:text-foreground border border-border transition-colors">
                Clear
              </button>
            )}
          </div>

          {/* Card grid */}
          {ownedUniqueCards.length === 0 ? (
            <p className="text-center text-muted-foreground py-6 text-sm">
              {search || ratingFilter.size > 0 ? 'No cars match your filters.' : "You don't own any cars yet."}
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-1">
              {ownedUniqueCards.map(c => (
                <button key={c.id} onClick={() => { onSelectCar(c); setShowCarPicker(false) }}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-xl transition-all hover:bg-muted/40 active:scale-95
                    ${selectedCar?.id === c.id ? 'ring-2 ring-primary' : ''}`}>
                  <CarCard car={c} size="sm" />
                  <span className="text-[10px] text-muted-foreground text-center leading-tight truncate w-full">{c.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </Modal>
    </div>
  )
}

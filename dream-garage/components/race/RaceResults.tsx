import Image from 'next/image'
import { CurrencyIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { card } from '@/app/_cards/repo'

type Props = {
  playerCar: card
  opponentCar: card
  result: 'win' | 'loss'
  playerTime: number
  opponentTime: number
  creditsEarned: number
  onRaceAgain: () => void
  onChangeEvent: () => void
}

function formatTime(seconds: number): string {
  if (seconds < 60) return `${seconds.toFixed(2)}s`
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(2).padStart(5, '0')
  return `${m}:${s}`
}

const ratingStripeClass: Record<string, string> = {
  'S+': 'bg-amber-400',
  S: 'bg-[#FF70A6]',
  A: 'bg-[#ff9770]',
  B: 'bg-[#5d536b]',
  C: 'bg-[#272838]',
}

function ResultCard({ car, time, winner }: { car: card; time: number; winner: boolean }) {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all
                  ${winner ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-border bg-muted/30'}`}
    >
      <div className="relative rounded-xl overflow-hidden shadow-md" style={{ width: 80, height: 112 }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
        <div className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[car.rating] ?? 'bg-muted'}`} />
        <div className="absolute inset-0 flex items-center justify-center p-2 pt-4">
          <Image
            src={car.image}
            width={100}
            height={100}
            alt={car.name}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
            className="drop-shadow-lg"
          />
        </div>
      </div>
      <p className="text-xs font-semibold text-center leading-tight">{car.name}</p>
      <p className="text-lg font-black tabular-nums">{formatTime(time)}</p>
      {winner && <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Winner</span>}
    </div>
  )
}

export function RaceResults({
  playerCar,
  opponentCar,
  result,
  playerTime,
  opponentTime,
  creditsEarned,
  onRaceAgain,
  onChangeEvent,
}: Props) {
  const won = result === 'win'

  return (
    <div className="flex flex-col items-center gap-8 max-w-md mx-auto">
      <div className="text-center">
        <p
          className="text-6xl font-black tracking-tight mb-2"
          style={{ color: won ? '#22c55e' : '#ef4444' }}
        >
          {won ? 'WIN!' : 'LOSS'}
        </p>
        <p className="text-sm text-muted-foreground">
          {won ? 'You crossed the line first.' : 'Better luck next time.'}
        </p>
        {won && creditsEarned > 0 && (
          <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/30">
            <CurrencyIcon size={14} className="text-amber-400" />
            <span className="text-sm font-bold text-amber-400">+{creditsEarned.toLocaleString()} credits</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1">You</span>
          <ResultCard car={playerCar} time={playerTime} winner={won} />
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">CPU</span>
          <ResultCard car={opponentCar} time={opponentTime} winner={!won} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground tabular-nums">
        Gap: {Math.abs(playerTime - opponentTime).toFixed(2)}s
      </p>

      <div className="flex flex-col gap-3 w-full">
        <Button onClick={onRaceAgain} className="w-full font-bold">
          Race Again
        </Button>
        <Button onClick={onChangeEvent} variant="outline" className="w-full">
          Change Event
        </Button>
      </div>
    </div>
  )
}

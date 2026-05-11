import { ZapIcon, RadioIcon, MountainIcon, CurrencyIcon } from 'lucide-react'
import { RaceEvent } from '@/app/_events/repo'
import { rewardRange } from '@/lib/raceEngine'

type StatRow = { name: string; stars: number }

const eventConfig: Record<string, {
  icon: React.ReactNode
  description: string
  stats: StatRow[]
  accent: string
}> = {
  drag: {
    icon: <ZapIcon size={28} />,
    description: 'First past the quarter mile. Pure speed and power.',
    stats: [
      { name: 'Top Speed',  stars: 3 },
      { name: 'Horsepower', stars: 3 },
      { name: 'Handling',   stars: 1 },
    ],
    accent: '#ff9770',
  },
  circuit: {
    icon: <RadioIcon size={28} />,
    description: 'Complete a full lap of a randomly generated closed circuit.',
    stats: [
      { name: 'Top Speed',  stars: 3 },
      { name: 'Horsepower', stars: 2 },
      { name: 'Handling',   stars: 2 },
    ],
    accent: '#FF70A6',
  },
  rally: {
    icon: <MountainIcon size={28} />,
    description: 'Timed stage on dirt or tarmac. Handling matters more on loose surfaces.',
    stats: [
      { name: 'Top Speed',  stars: 2 },
      { name: 'Horsepower', stars: 2 },
      { name: 'Handling',   stars: 3 },
    ],
    accent: '#fbbf24',
  },
}

type Props = {
  event: RaceEvent
  onSelect: (event: RaceEvent) => void
}

export function EventCard({ event, onSelect }: Props) {
  const config = eventConfig[event.type]
  const [minReward, maxReward] = rewardRange(event.type)

  return (
    <button
      onClick={() => onSelect(event)}
      className="w-full text-left relative overflow-hidden rounded-2xl shadow-md
                 transition-all duration-200 active:scale-[0.98] group
                 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(26,27,46,0.4)]"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b2e] via-[#272838] to-[#3a3352]" />
      <div
        className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/0
                    opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
      />

      <div className="relative flex flex-col justify-between px-6 pt-8 pb-5 min-h-[400px]">
        {/* Top: icon + name + description */}
        <div className="flex flex-col gap-5">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ backgroundColor: `${config.accent}22`, color: config.accent }}
          >
            {config.icon}
          </div>

          <div className="flex flex-col gap-2">
            <p className="font-bold text-lg text-white leading-tight">{event.name}</p>
            <p className="text-sm text-white/50 leading-relaxed">{config.description}</p>
          </div>
        </div>

        {/* Bottom: stats list + credit range */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-0">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: config.accent }}>
              Stats
            </p>
            {config.stats.map(({ name, stars }) => (
              <div key={name} className="flex items-center justify-between py-1 border-t border-white/5">
                <span className="text-xs text-white/55">{name}</span>
                <div className="flex gap-0.5">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <span
                      key={i}
                      className="text-sm leading-none"
                      style={{ color: i < stars ? config.accent : 'rgba(255,255,255,0.12)' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end">
            <div className="flex items-center gap-1" style={{ color: `${config.accent}88` }}>
              <CurrencyIcon size={11} />
              <span className="text-[11px] font-semibold tabular-nums">
                {minReward.toLocaleString()}–{maxReward.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </button>
  )
}

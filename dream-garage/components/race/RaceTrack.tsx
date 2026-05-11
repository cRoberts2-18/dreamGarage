'use client'
import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { card } from '@/app/_cards/repo'
import { Stage, simulateRace, RaceResult } from '@/lib/raceEngine'
import { TrackMap } from '@/components/race/TrackMap'

type Props = {
  stage: Stage
  playerCar: card
  opponentCar: card
  onComplete: (result: 'win' | 'loss', playerTime: number, opponentTime: number) => void
}

const RACE_DURATION_MS = 11000
const MAX_OFFSET_PX = 90

export function RaceTrack({ stage, playerCar, opponentCar, onComplete }: Props) {
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0)
  const [playerOffsetPx, setPlayerOffsetPx] = useState(0)
  const [opponentOffsetPx, setOpponentOffsetPx] = useState(0)
  const raceResult = useRef<RaceResult | null>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  const isDrag = stage.sections.length === 1

  useEffect(() => {
    const result = simulateRace(stage, playerCar, opponentCar)
    raceResult.current = result

    if (isDrag) {
      const playerTotalMs = result.playerTotal * 1000
      const opponentTotalMs = result.opponentTotal * 1000
      const totalDurationMs = Math.max(playerTotalMs, opponentTotalMs)

      // Start cars at the bottom of the strip
      setPlayerOffsetPx(MAX_OFFSET_PX)
      setOpponentOffsetPx(MAX_OFFSET_PX)

      let startTime: number | null = null
      let rafId: number
      let completed = false

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const elapsed = timestamp - startTime

        const pp = Math.min(1, elapsed / playerTotalMs)
        const op = Math.min(1, elapsed / opponentTotalMs)

        // Both start at +MAX_OFFSET_PX (start line) and race toward -MAX_OFFSET_PX (finish)
        setPlayerOffsetPx(MAX_OFFSET_PX - pp * MAX_OFFSET_PX * 2)
        setOpponentOffsetPx(MAX_OFFSET_PX - op * MAX_OFFSET_PX * 2)

        if (elapsed < totalDurationMs + 1200) {
          rafId = requestAnimationFrame(animate)
        } else if (!completed) {
          completed = true
          const r = raceResult.current!
          onCompleteRef.current(
            r.playerTotal <= r.opponentTotal ? 'win' : 'loss',
            r.playerTotal,
            r.opponentTotal
          )
        }
      }

      const startDelay = setTimeout(() => {
        rafId = requestAnimationFrame(animate)
      }, 200)

      return () => {
        clearTimeout(startDelay)
        cancelAnimationFrame(rafId)
      }
    }

    // Circuit / rally: section-based animation compressed to RACE_DURATION_MS
    const sectionDuration = RACE_DURATION_MS / stage.sections.length
    let sectionIdx = 0
    let timerId: ReturnType<typeof setTimeout>

    const tick = () => {
      if (sectionIdx >= stage.sections.length) {
        const r = raceResult.current!
        onCompleteRef.current(
          r.playerTotal <= r.opponentTotal ? 'win' : 'loss',
          r.playerTotal,
          r.opponentTotal
        )
        return
      }

      setCurrentSectionIdx(sectionIdx)

      const lead = result.cumulativeLeadAfterSection[sectionIdx]
      const raw = lead * 2 // seconds of lead → pixels (scaled down since leads are now larger)
      const clamped = Math.max(-MAX_OFFSET_PX, Math.min(MAX_OFFSET_PX, raw))
      setPlayerOffsetPx(clamped)
      setOpponentOffsetPx(-clamped)

      sectionIdx++
      timerId = setTimeout(tick, sectionDuration)
    }

    timerId = setTimeout(tick, 200)
    return () => clearTimeout(timerId)
  }, [])

  const section = stage.sections[currentSectionIdx]

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Section indicator + minimap */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 flex items-center gap-3 bg-primary rounded-xl px-5 py-2.5">
          <span className="text-xl text-white">{section.arrow}</span>
          <span className="font-bold text-white">{section.label}</span>
          {stage.surface === 'dirt' && (
            <span className="text-xs font-bold text-white/70 border border-white/30 rounded px-1.5 py-0.5">
              DIRT
            </span>
          )}
          <span className="text-xs text-white/60 ml-auto">
            {isDrag ? '402m' : `${currentSectionIdx + 1}/${stage.sections.length}`}
          </span>
        </div>

        {/* Minimap */}
        <div className="shrink-0 bg-[#1a1b2e] rounded-xl border border-white/10 overflow-hidden">
          <TrackMap
            stage={stage}
            currentSectionIdx={isDrag ? undefined : currentSectionIdx}
            width={110}
            height={70}
            accent="#FF70A6"
          />
        </div>
      </div>

      {/* Tracks */}
      <div className="flex gap-16 justify-center items-stretch" style={{ height: '50vh', minHeight: 280 }}>
        <TrackLane label="YOU" car={playerCar} offsetPx={playerOffsetPx} isPlayer isDrag={isDrag} />
        <TrackLane label="CPU" car={opponentCar} offsetPx={opponentOffsetPx} isPlayer={false} isDrag={isDrag} />
      </div>
    </div>
  )
}

type LaneProps = {
  label: string
  car: card
  offsetPx: number
  isPlayer: boolean
  isDrag: boolean
}

const ratingStripeClass: Record<string, string> = {
  'S+': 'bg-amber-400',
  S: 'bg-[#FF70A6]',
  A: 'bg-[#ff9770]',
  B: 'bg-[#5d536b]',
  C: 'bg-[#272838]',
}

function TrackLane({ label, car, offsetPx, isPlayer, isDrag }: LaneProps) {
  return (
    <div className="flex flex-col items-center gap-3" style={{ width: 110 }}>
      <span className={`text-xs font-bold uppercase tracking-widest ${isPlayer ? 'text-primary' : 'text-muted-foreground'}`}>
        {label}
      </span>

      {/* Track lane */}
      <div className="flex-1 relative w-full rounded-2xl bg-border/15 border border-border/30 overflow-hidden flex items-center justify-center">
        {isDrag ? (
          <>
            {/* Checkered finish line at top */}
            <div className="absolute top-[6%] inset-x-0 flex">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className={`flex-1 h-2 ${i % 2 === 0 ? 'bg-white/65' : 'bg-black/40'}`} />
              ))}
            </div>
            {/* Start line at bottom */}
            <div className="absolute bottom-[6%] inset-x-0 h-0.5 bg-primary/60" />
            {/* Centre dashes */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-5 rounded-full bg-border/20"
                style={{ top: `${14 + i * 13}%` }}
              />
            ))}
          </>
        ) : (
          Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-4 rounded-full bg-border/30"
              style={{ top: `${10 + i * 11}%` }}
            />
          ))
        )}

        {/* Car card */}
        <div
          className="absolute"
          style={{
            transform: `translateY(${offsetPx}px)`,
            transition: isDrag ? 'none' : 'transform 500ms ease-in-out',
          }}
        >
          <div className="relative rounded-lg overflow-hidden shadow-lg border border-white/10" style={{ width: 70, height: 98 }}>
            <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
            <div className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[car.rating] ?? 'bg-muted'}`} />
            <div className="absolute inset-0 flex items-center justify-center p-1 pt-3">
              <Image
                src={car.image}
                width={80}
                height={80}
                alt={car.name}
                style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
                className="drop-shadow-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <span className="text-xs text-muted-foreground truncate max-w-full text-center">{car.name}</span>
    </div>
  )
}

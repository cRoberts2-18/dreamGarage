'use client'
import { useEffect, useState, useCallback } from 'react'
import { card, getCards, getOwnedCards } from '@/app/_cards/repo'
import { RaceEvent, Opponent, getEvents, getOpponent } from '@/app/_events/repo'
import { saveRace } from '@/app/_races/repo'
import { Stage, generateStage, calculateReward } from '@/lib/raceEngine'
import { updatePoints } from '@/app/_user/repo'
import { EventCard } from '@/components/race/EventCard'
import { RaceSetup } from '@/components/race/RaceSetup'
import { RaceLights } from '@/components/race/RaceLights'
import { RaceTrack } from '@/components/race/RaceTrack'
import { RaceResults } from '@/components/race/RaceResults'

type Phase = 'events' | 'setup' | 'lights' | 'track' | 'results'

type RaceOutcome = {
  result: 'win' | 'loss'
  playerTime: number
  opponentTime: number
  creditsEarned: number
}

export default function RacePage() {
  // Data
  const [events, setEvents] = useState<RaceEvent[]>([])
  const [allCards, setAllCards] = useState<card[]>([])
  const [ownedCardIds, setOwnedCardIds] = useState<number[]>([])

  // Race state
  const [phase, setPhase] = useState<Phase>('events')
  const [selectedEvent, setSelectedEvent] = useState<RaceEvent | null>(null)
  const [opponent, setOpponent] = useState<Opponent | null>(null)
  const [shuffling, setShuffling] = useState(false)
  const [playerCar, setPlayerCar] = useState<card | null>(null)
  const [stage, setStage] = useState<Stage | null>(null)
  const [outcome, setOutcome] = useState<RaceOutcome | null>(null)
  const [raceKey, setRaceKey] = useState(0)

  useEffect(() => {
    Promise.all([getEvents(), getCards(), getOwnedCards()]).then(
      ([evts, cards, owned]) => {
        setEvents(evts)
        setAllCards(cards)
        setOwnedCardIds(owned ?? [])
      }
    )
  }, [])

  const fetchOpponent = useCallback(async (eventId: number) => {
    const opp = await getOpponent(eventId)
    setOpponent(opp)
  }, [])

  const handleSelectEvent = useCallback(
    async (event: RaceEvent) => {
      setSelectedEvent(event)
      setOpponent(null)
      setPlayerCar(null)
      setStage(generateStage(event.type))
      setPhase('setup')
      await fetchOpponent(event.id)
    },
    [fetchOpponent]
  )

  const handleShuffle = useCallback(async () => {
    if (!selectedEvent) return
    setShuffling(true)
    await fetchOpponent(selectedEvent.id)
    setShuffling(false)
  }, [selectedEvent, fetchOpponent])

  const handleRace = useCallback(() => {
    setOutcome(null)
    setRaceKey((k) => k + 1)
    setPhase('lights')
  }, [])

  const handleLightsComplete = useCallback(() => {
    setPhase('track')
  }, [])

  const handleTrackComplete = useCallback(
    async (result: 'win' | 'loss', playerTime: number, opponentTime: number) => {
      let creditsEarned = 0

      if (result === 'win' && selectedEvent && opponent) {
        creditsEarned = calculateReward(selectedEvent.type, opponent.difficulty)
        const userString = localStorage.getItem('user')
        const user = userString ? JSON.parse(userString) : {}
        const newPoints = (user.points || 0) + creditsEarned
        await updatePoints(newPoints, user.id, user.streak || 1)
        window.dispatchEvent(new CustomEvent('points-updated', { detail: { points: newPoints } }))
      }

      setOutcome({ result, playerTime, opponentTime, creditsEarned })
      setPhase('results')

      if (selectedEvent && playerCar && opponent) {
        await saveRace({
          eventId: selectedEvent.id,
          userCardId: playerCar.id,
          opponentCardId: opponent.card.id,
          result,
          userTime: playerTime,
          opponentTime,
        })
      }
    },
    [selectedEvent, playerCar, opponent]
  )

  const handleRaceAgain = useCallback(() => {
    if (!selectedEvent) return
    const newStage = generateStage(selectedEvent.type)
    setStage(newStage)
    setOutcome(null)
    setRaceKey((k) => k + 1)
    setPhase('lights')
  }, [selectedEvent])

  const handleChangeEvent = useCallback(() => {
    setSelectedEvent(null)
    setOpponent(null)
    setPlayerCar(null)
    setStage(null)
    setOutcome(null)
    setPhase('events')
  }, [])

  return (
    <div className="px-4 py-6 max-w-3xl mx-auto">
      {phase === 'events' && (
        <div className="flex flex-col gap-6">
          <div>
            <h1>Race</h1>
            <p className="text-sm text-muted-foreground">Choose your event and take on the CPU.</p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {events.map((event) => (
              <EventCard key={event.id} event={event} onSelect={handleSelectEvent} />
            ))}
          </div>
        </div>
      )}

      {phase === 'setup' && selectedEvent && (
        <RaceSetup
          event={selectedEvent}
          stage={stage}
          opponent={opponent}
          shuffling={shuffling}
          onShuffle={handleShuffle}
          allCards={allCards}
          ownedCardIds={ownedCardIds}
          selectedCar={playerCar}
          onSelectCar={setPlayerCar}
          onRace={handleRace}
          onBack={handleChangeEvent}
        />
      )}

      {(phase === 'lights' || phase === 'track') && stage && playerCar && opponent && (
        <div className="flex flex-col gap-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">
              {selectedEvent?.name} · {stage.name}
            </p>
          </div>

          {phase === 'lights' && <RaceLights onComplete={handleLightsComplete} />}

          {phase === 'track' && (
            <RaceTrack
              key={raceKey}
              stage={stage}
              playerCar={playerCar}
              opponentCar={opponent.card}
              onComplete={handleTrackComplete}
            />
          )}
        </div>
      )}

      {phase === 'results' && outcome && playerCar && opponent && (
        <RaceResults
          playerCar={playerCar}
          opponentCar={opponent.card}
          result={outcome.result}
          playerTime={outcome.playerTime}
          opponentTime={outcome.opponentTime}
          creditsEarned={outcome.creditsEarned}
          onRaceAgain={handleRaceAgain}
          onChangeEvent={handleChangeEvent}
        />
      )}
    </div>
  )
}

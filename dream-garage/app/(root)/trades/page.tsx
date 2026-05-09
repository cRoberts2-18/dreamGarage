'use client'
import { useEffect, useState, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  PlusIcon,
  ArrowLeftRightIcon,
  CheckIcon,
  XIcon,
  Repeat2Icon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { toast } from 'sonner'
import { card, getCards, getOwnedCards } from '@/app/_cards/repo'
import { FriendInfo, getFriends, getFriendCards } from '@/app/_friends/repo'
import {
  TradeDetail,
  getActiveTrades,
  getTradeHistory,
  createTrade,
  acceptTrade,
  rejectTrade,
  cancelTrade,
  counterTrade
} from '@/app/_trades/repo'

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

const SLOT_WIDTH = 110

function countMap(ids: number[]): Record<number, number> {
  const result: Record<number, number> = {}
  for (const id of ids) result[id] = (result[id] ?? 0) + 1
  return result
}

function MiniCard({ c }: { c: card }) {
  return (
    <div className="relative shrink-0 animate-trade-fade-in" style={{ width: 72 }}>
      <span
        className={`absolute -top-1.5 -right-1.5 z-10 h-5 w-5 flex items-center justify-center text-[9px] font-bold rounded-full shadow ${ratingBadgeClass[c.rating] ?? 'bg-muted'}`}
      >
        {c.rating}
      </span>
      <div className="relative w-full overflow-hidden rounded-lg shadow" style={{ aspectRatio: '5/7' }}>
        <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
        <div className={`absolute top-0 inset-x-0 h-0.5 ${ratingStripeClass[c.rating] ?? 'bg-muted'}`} />
        <div className="absolute top-0.5 inset-x-0 bg-black/55 px-1 py-0.5">
          <span className="text-white font-semibold truncate block text-center text-[7px] leading-tight">
            {c.name}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-1 pt-6 pb-1">
          <Image
            src={c.image}
            width={80}
            height={80}
            alt={c.name}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
            className="drop-shadow-lg"
          />
        </div>
      </div>
    </div>
  )
}

function SlotCard({
  c,
  onRemove,
  count
}: {
  c: card
  onRemove?: () => void
  count?: number
}) {
  return (
    <div className="relative shrink-0" style={{ width: SLOT_WIDTH }}>
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1.5 left-1.5 z-20 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center hover:bg-black/90 transition-colors"
        >
          <XIcon size={10} className="text-white" />
        </button>
      )}
      <span
        className={`absolute -top-2 -right-2 z-10 h-7 w-7 flex items-center justify-center text-xs font-bold rounded-full shadow-md ${ratingBadgeClass[c.rating] ?? 'bg-muted'}`}
      >
        {c.rating}
      </span>
      {count !== undefined && count > 1 && (
        <span className="absolute -top-2 -left-2 z-10 h-5 min-w-5 px-1 rounded-full bg-foreground/80 text-[9px] font-bold text-background flex items-center justify-center leading-none">
          ×{count}
        </span>
      )}
      <div
        className="relative w-full overflow-hidden rounded-xl shadow-lg"
        style={{ aspectRatio: '5/7' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
        <div className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[c.rating] ?? 'bg-muted'}`} />
        <div className="absolute top-1 inset-x-0 bg-black/55 px-2 py-1.5">
          <span className="text-white font-semibold truncate block text-center text-xs">
            {c.name}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-2 pt-10 pb-2">
          <Image
            src={c.image}
            width={200}
            height={200}
            alt={c.name}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
            className="drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  )
}

function EmptySlot({ onAdd }: { onAdd?: () => void }) {
  return (
    <button
      type="button"
      onClick={onAdd}
      disabled={!onAdd}
      className={`shrink-0 rounded-xl border-2 border-dashed flex items-center justify-center transition-colors ${
        onAdd
          ? 'border-border/40 hover:border-accent/60 cursor-pointer'
          : 'border-border/20 cursor-default'
      }`}
      style={{ width: SLOT_WIDTH, aspectRatio: '5/7' }}
    >
      {onAdd && <PlusIcon size={18} className="text-muted-foreground/30" />}
    </button>
  )
}

function TradeSlotRow({
  label,
  slots,
  onAdd,
  onRemove,
  counts
}: {
  label: string
  slots: (card | null)[]
  onAdd?: (index: number) => void
  onRemove?: (index: number) => void
  counts?: Record<number, number>
}) {
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex gap-3">
        {slots.map((c, i) =>
          c ? (
            <SlotCard
              key={i}
              c={c}
              onRemove={onRemove ? () => onRemove(i) : undefined}
              count={counts?.[c.id]}
            />
          ) : (
            <EmptySlot key={i} onAdd={onAdd ? () => onAdd(i) : undefined} />
          )
        )}
      </div>
    </div>
  )
}

function PickerCard({ c, onClick, count }: { c: card; onClick: () => void; count?: number }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative shrink-0 hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-accent rounded-xl"
      style={{ width: 80 }}
    >
      <span
        className={`absolute -top-2 -right-2 z-10 h-6 w-6 flex items-center justify-center text-[9px] font-bold rounded-full shadow ${ratingBadgeClass[c.rating] ?? 'bg-muted'}`}
      >
        {c.rating}
      </span>
      {count !== undefined && count > 1 && (
        <span className="absolute -top-2 -left-2 z-10 h-5 min-w-5 px-1 rounded-full bg-foreground/80 text-[8px] font-bold text-background flex items-center justify-center leading-none">
          ×{count}
        </span>
      )}
      <div
        className="relative w-full overflow-hidden rounded-xl shadow"
        style={{ aspectRatio: '5/7' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
        <div className={`absolute top-0 inset-x-0 h-0.5 ${ratingStripeClass[c.rating] ?? 'bg-muted'}`} />
        <div className="absolute top-1 inset-x-0 bg-black/55 px-1.5 py-1">
          <span className="text-white font-semibold truncate block text-center text-[8px] leading-tight">
            {c.name}
          </span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center p-1 pt-8 pb-1">
          <Image
            src={c.image}
            width={80}
            height={80}
            alt={c.name}
            style={{ objectFit: 'contain', maxWidth: '100%', maxHeight: '100%', height: 'auto' }}
            className="drop-shadow-lg"
          />
        </div>
      </div>
    </button>
  )
}

type PickerTarget = { side: 'my' | 'friend'; index: number }

function TradeComposer({
  myCards,
  friendCards,
  friendLabel,
  onSubmit,
  onCancel,
  submitLabel,
  initialMyCards,
  initialFriendCards,
  loading,
  myCounts,
  friendCounts
}: {
  myCards: card[]
  friendCards: card[]
  friendLabel: string
  onSubmit: (mySelected: number[], friendSelected: number[]) => void
  onCancel: () => void
  submitLabel: string
  initialMyCards?: card[]
  initialFriendCards?: card[]
  loading: boolean
  myCounts?: Record<number, number>
  friendCounts?: Record<number, number>
}) {
  const blank5 = (): (card | null)[] => [null, null, null, null, null]

  const [mySlots, setMySlots] = useState<(card | null)[]>(() => {
    const s = blank5()
    initialMyCards?.forEach((c, i) => { s[i] = c })
    return s
  })
  const [friendSlots, setFriendSlots] = useState<(card | null)[]>(() => {
    const s = blank5()
    initialFriendCards?.forEach((c, i) => { s[i] = c })
    return s
  })
  const [picker, setPicker] = useState<PickerTarget | null>(null)

  function selectCard(c: card) {
    if (!picker) return
    if (picker.side === 'my') {
      setMySlots((prev) => { const n = [...prev]; n[picker.index] = c; return n })
    } else {
      setFriendSlots((prev) => { const n = [...prev]; n[picker.index] = c; return n })
    }
    setPicker(null)
  }

  function removeCard(side: 'my' | 'friend', index: number) {
    if (side === 'my') {
      setMySlots((prev) => { const n = [...prev]; n[index] = null; return n })
    } else {
      setFriendSlots((prev) => { const n = [...prev]; n[index] = null; return n })
    }
  }

  const mySelectedIds = new Set(mySlots.filter(Boolean).map((c) => c!.id))
  const friendSelectedIds = new Set(friendSlots.filter(Boolean).map((c) => c!.id))
  const pickerCards =
    picker?.side === 'my'
      ? myCards.filter((c) => !mySelectedIds.has(c.id))
      : friendCards.filter((c) => !friendSelectedIds.has(c.id))
  const pickerCounts = picker?.side === 'my' ? myCounts : friendCounts

  const canSubmit = mySlots.some(Boolean) || friendSlots.some(Boolean)

  return (
    <>
      <div className="space-y-5 pt-2">
        <TradeSlotRow
          label="You offer"
          slots={mySlots}
          onAdd={(i) => setPicker({ side: 'my', index: i })}
          onRemove={(i) => removeCard('my', i)}
          counts={myCounts}
        />
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/40" />
          <ArrowLeftRightIcon size={16} className="text-muted-foreground/50 shrink-0" />
          <div className="flex-1 h-px bg-border/40" />
        </div>
        <TradeSlotRow
          label={friendLabel}
          slots={friendSlots}
          onAdd={(i) => setPicker({ side: 'friend', index: i })}
          onRemove={(i) => removeCard('friend', i)}
          counts={friendCounts}
        />
        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <Button
            disabled={!canSubmit || loading}
            onClick={() =>
              onSubmit(
                mySlots.filter(Boolean).map((c) => c!.id),
                friendSlots.filter(Boolean).map((c) => c!.id)
              )
            }
          >
            {loading ? (
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              submitLabel
            )}
          </Button>
        </div>
      </div>

      <Modal
        showModal={picker !== null}
        title={picker?.side === 'my' ? 'Choose a card to offer' : 'Choose a card to request'}
        onClose={() => setPicker(null)}
      >
        {pickerCards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No cards available</p>
        ) : (
          <div className="flex flex-wrap gap-3 py-2">
            {pickerCards.map((c) => (
              <PickerCard key={c.id} c={c} onClick={() => selectCard(c)} count={pickerCounts?.[c.id]} />
            ))}
          </div>
        )}
      </Modal>
    </>
  )
}

function TradeSlotDisplay({
  label,
  cardIds,
  allCards
}: {
  label: string
  cardIds: number[]
  allCards: card[]
}) {
  const slots: (card | null)[] = Array.from({ length: 5 }, (_, i) => {
    const id = cardIds[i]
    return id != null ? (allCards.find((c) => c.id === id) ?? null) : null
  })
  return (
    <div className="space-y-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {label}
      </p>
      <div className="flex gap-3">
        {slots.map((c, i) =>
          c ? <SlotCard key={i} c={c} /> : <EmptySlot key={i} />
        )}
      </div>
    </div>
  )
}

function IncomingTradeCard({
  trade,
  allCards,
  myCards,
  myId,
  myCardCounts,
  onAccept,
  onCounter,
  onReject,
  isLoading
}: {
  trade: TradeDetail
  allCards: card[]
  myCards: card[]
  myId: number
  myCardCounts: Record<number, number>
  onAccept: () => void
  onCounter: (mySelected: number[], friendSelected: number[]) => void
  onReject: () => void
  isLoading: boolean
}) {
  const theirUsername =
    trade.initiatorId === myId ? trade.recipientUsername : trade.initiatorUsername
  const otherId =
    trade.initiatorId === myId ? trade.recipientId : trade.initiatorId

  const originalMyIds = (
    trade.initiatorId === myId ? trade.initiatorCards : trade.recipientCards
  ).map((i) => i.cardId)

  const originalTheirIds = (
    trade.initiatorId === myId ? trade.recipientCards : trade.initiatorCards
  ).map((i) => i.cardId)

  const initSlots = (cardIds: number[]): (card | null)[] => {
    const s: (card | null)[] = [null, null, null, null, null]
    cardIds.forEach((id, i) => { s[i] = allCards.find((c) => c.id === id) ?? null })
    return s
  }

  const [friendSlots, setFriendSlots] = useState(() => initSlots(originalTheirIds))
  const [mySlots, setMySlots] = useState(() => initSlots(originalMyIds))
  const [picker, setPicker] = useState<PickerTarget | null>(null)
  const [friendCardIds, setFriendCardIds] = useState<number[] | null>(null)
  const [loadingFriendCards, setLoadingFriendCards] = useState(false)

  const friendCounts = useMemo(
    () => (friendCardIds ? countMap(friendCardIds) : {}),
    [friendCardIds]
  )

  async function ensureFriendCards() {
    if (friendCardIds !== null) return
    setLoadingFriendCards(true)
    const ids = await getFriendCards(otherId)
    setFriendCardIds(ids ?? [])
    setLoadingFriendCards(false)
  }

  async function openPicker(side: 'my' | 'friend', index: number) {
    if (side === 'friend') await ensureFriendCards()
    setPicker({ side, index })
  }

  function selectCard(c: card) {
    if (!picker) return
    if (picker.side === 'my') {
      setMySlots((prev) => { const n = [...prev]; n[picker.index] = c; return n })
    } else {
      setFriendSlots((prev) => { const n = [...prev]; n[picker.index] = c; return n })
    }
    setPicker(null)
  }

  function removeCard(side: 'my' | 'friend', index: number) {
    if (side === 'my') {
      setMySlots((prev) => { const n = [...prev]; n[index] = null; return n })
    } else {
      setFriendSlots((prev) => { const n = [...prev]; n[index] = null; return n })
    }
  }

  const currentMyStr = mySlots.filter(Boolean).map((c) => c!.id).sort().join(',')
  const currentFriendStr = friendSlots.filter(Boolean).map((c) => c!.id).sort().join(',')
  const isChanged =
    currentMyStr !== [...originalMyIds].sort().join(',') ||
    currentFriendStr !== [...originalTheirIds].sort().join(',')

  const mySelectedIds = new Set(mySlots.filter(Boolean).map((c) => c!.id))
  const friendSelectedIds = new Set(friendSlots.filter(Boolean).map((c) => c!.id))
  const friendCardsForPicker = (friendCardIds ?? [])
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is card => c != null)

  const pickerCards =
    picker?.side === 'my'
      ? myCards.filter((c) => !mySelectedIds.has(c.id))
      : friendCardsForPicker.filter((c) => !friendSelectedIds.has(c.id))

  const pickerCounts = picker?.side === 'my' ? myCardCounts : friendCounts

  const canAction = mySlots.some(Boolean) || friendSlots.some(Boolean)

  return (
    <li className="rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-5 space-y-5">
        <p className="text-sm font-semibold text-muted-foreground">
          From <span className="text-foreground">{theirUsername}</span>
        </p>

        <TradeSlotRow
          label="They offer"
          slots={friendSlots}
          onAdd={(i) => openPicker('friend', i)}
          onRemove={(i) => removeCard('friend', i)}
          counts={friendCounts}
        />

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border/40" />
          <ArrowLeftRightIcon size={16} className="text-muted-foreground/50 shrink-0" />
          <div className="flex-1 h-px bg-border/40" />
        </div>

        <TradeSlotRow
          label="You give"
          slots={mySlots}
          onAdd={(i) => openPicker('my', i)}
          onRemove={(i) => removeCard('my', i)}
          counts={myCardCounts}
        />

        <div className="flex gap-2 pt-1">
          <button
            disabled={isLoading || !canAction}
            onClick={() => {
              if (isChanged) {
                onCounter(
                  mySlots.filter(Boolean).map((c) => c!.id),
                  friendSlots.filter(Boolean).map((c) => c!.id)
                )
              } else {
                onAccept()
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 ${
              isChanged
                ? 'border border-border text-muted-foreground hover:bg-muted'
                : 'bg-primary text-primary-foreground hover:bg-primary/90'
            }`}
          >
            {isLoading ? (
              <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : isChanged ? (
              <Repeat2Icon size={13} />
            ) : (
              <CheckIcon size={13} />
            )}
            {isChanged ? 'Counter' : 'Accept'}
          </button>
          <button
            disabled={isLoading}
            onClick={onReject}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
          >
            <XIcon size={13} />
            Decline
          </button>
        </div>
      </div>

      <Modal
        showModal={picker !== null}
        title={picker?.side === 'my' ? 'Choose a card to give' : 'Choose a card to request'}
        onClose={() => setPicker(null)}
      >
        {loadingFriendCards ? (
          <div className="flex justify-center py-8">
            <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        ) : pickerCards.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No cards available</p>
        ) : (
          <div className="flex flex-wrap gap-3 py-2">
            {pickerCards.map((c) => (
              <PickerCard key={c.id} c={c} onClick={() => selectCard(c)} count={pickerCounts?.[c.id]} />
            ))}
          </div>
        )}
      </Modal>
    </li>
  )
}

function TradeCompleteModal({
  giving,
  receiving,
  onClose
}: {
  giving: card[]
  receiving: card[]
  onClose: () => void
}) {
  const [showCheck, setShowCheck] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCheck(true), 700)
    return () => clearTimeout(t)
  }, [])

  return (
    <Modal showModal title="Trade Complete!" onClose={onClose}>
      <div className="space-y-6 py-2">
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
              You gave
            </p>
            <div
              className={`flex flex-wrap gap-2 justify-center transition-opacity duration-700 ${showCheck ? 'opacity-35' : 'opacity-100'}`}
            >
              {giving.length > 0 ? (
                giving.map((c) => <MiniCard key={c.id} c={c} />)
              ) : (
                <p className="text-xs text-muted-foreground py-4">Nothing</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center">
              You received
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {receiving.length > 0 ? (
                receiving.map((c, i) => (
                  <div
                    key={c.id}
                    className="animate-trade-fade-in"
                    style={{ animationDelay: `${i * 80}ms` }}
                  >
                    <MiniCard c={c} />
                  </div>
                ))
              ) : (
                <p className="text-xs text-muted-foreground py-4">Nothing</p>
              )}
            </div>
          </div>
        </div>

        {showCheck && (
          <div className="flex flex-col items-center gap-1.5 animate-check-bounce">
            <CheckIcon size={36} className="text-green-500" strokeWidth={2.5} />
            <p className="text-sm font-semibold text-green-600">Cards transferred!</p>
          </div>
        )}

        <div className="flex justify-center">
          <Button onClick={onClose}>Done</Button>
        </div>
      </div>
    </Modal>
  )
}

function dispatchTradeCount(trades: TradeDetail[], myId: number) {
  const count = trades.filter((t) => t.pendingUserId === myId).length
  window.dispatchEvent(new CustomEvent('pending-trades-updated', { detail: { count } }))
}

export default function TradesPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [allCards, setAllCards] = useState<card[]>([])
  const [ownedCardIds, setOwnedCardIds] = useState<number[]>([])
  const [friends, setFriends] = useState<FriendInfo[]>([])
  const [trades, setTrades] = useState<TradeDetail[]>([])
  const [tradeHistory, setTradeHistory] = useState<TradeDetail[]>([])

  const [composerOpen, setComposerOpen] = useState(false)
  const [selectedFriendId, setSelectedFriendId] = useState<number | null>(null)
  const [friendPickerOpen, setFriendPickerOpen] = useState(false)
  const [friendCardIds, setFriendCardIds] = useState<number[]>([])
  const [loadingFriendCards, setLoadingFriendCards] = useState(false)
  const [submittingTrade, setSubmittingTrade] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [acceptedTrade, setAcceptedTrade] = useState<{ giving: card[]; receiving: card[] } | null>(null)

  const currentUserId = (): number => {
    const u = localStorage.getItem('user')
    return u ? JSON.parse(u).id : 0
  }

  const loadData = useCallback(async () => {
    const [cards, owned, friendsList, activeTrades, history] = await Promise.all([
      getCards(),
      getOwnedCards(),
      getFriends(),
      getActiveTrades(),
      getTradeHistory()
    ])
    const myId = currentUserId()
    setAllCards(cards ?? [])
    setOwnedCardIds(owned ?? [])
    setFriends(friendsList ?? [])
    setTrades(activeTrades ?? [])
    setTradeHistory(history ?? [])
    dispatchTradeCount(activeTrades ?? [], myId)
  }, [])

  useEffect(() => { loadData() }, [loadData])

  useEffect(() => {
    const friendId = searchParams.get('friendId')
    if (friendId && friends.length > 0) {
      const id = parseInt(friendId)
      if (friends.some((f) => f.friendId === id)) {
        openComposerForFriend(id)
        router.replace('/trades')
      }
    }
  }, [searchParams, friends])

  async function openComposerForFriend(friendId: number) {
    setSelectedFriendId(friendId)
    setComposerOpen(true)
    setLoadingFriendCards(true)
    const ids = await getFriendCards(friendId)
    setFriendCardIds(ids ?? [])
    setLoadingFriendCards(false)
  }

  async function handleSendTrade(mySelected: number[], friendSelected: number[]) {
    if (!selectedFriendId) return
    setSubmittingTrade(true)
    const error = await createTrade(selectedFriendId, mySelected, friendSelected)
    setSubmittingTrade(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Trade sent!')
      setComposerOpen(false)
      setSelectedFriendId(null)
      await loadData()
    }
  }

  async function handleAccept(tradeId: number) {
    const trade = trades.find((t) => t.id === tradeId)
    setActionLoadingId(tradeId)
    const error = await acceptTrade(tradeId)
    setActionLoadingId(null)
    if (error) {
      toast.error(error)
      await loadData()
    } else {
      if (trade) {
        const myId = currentUserId()
        const givingIds = (trade.initiatorId === myId ? trade.initiatorCards : trade.recipientCards).map((i) => i.cardId)
        const receivingIds = (trade.initiatorId === myId ? trade.recipientCards : trade.initiatorCards).map((i) => i.cardId)
        const giving = givingIds.map((id) => allCards.find((c) => c.id === id)).filter((c): c is card => !!c)
        const receiving = receivingIds.map((id) => allCards.find((c) => c.id === id)).filter((c): c is card => !!c)
        setAcceptedTrade({ giving, receiving })
      }
      setTrades((prev) => {
        const updated = prev.filter((t) => t.id !== tradeId)
        dispatchTradeCount(updated, currentUserId())
        return updated
      })
    }
  }

  async function handleCounter(
    tradeId: number,
    mySelected: number[],
    friendSelected: number[]
  ) {
    setActionLoadingId(tradeId)
    const error = await counterTrade(tradeId, mySelected, friendSelected)
    setActionLoadingId(null)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Counter offer sent!')
      await loadData()
    }
  }

  async function handleReject(tradeId: number) {
    setActionLoadingId(tradeId)
    const error = await rejectTrade(tradeId)
    setActionLoadingId(null)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Trade declined')
      setTrades((prev) => {
        const updated = prev.filter((t) => t.id !== tradeId)
        dispatchTradeCount(updated, currentUserId())
        return updated
      })
    }
  }

  async function handleCancel(tradeId: number) {
    setActionLoadingId(tradeId)
    const error = await cancelTrade(tradeId)
    setActionLoadingId(null)
    if (error) {
      toast.error(error)
    } else {
      toast.success('Trade cancelled')
      setTrades((prev) => {
        const updated = prev.filter((t) => t.id !== tradeId)
        dispatchTradeCount(updated, currentUserId())
        return updated
      })
    }
  }

  const myId = currentUserId()
  const myCards = allCards.filter((c) => ownedCardIds.includes(c.id))
  const myCardCounts = useMemo(() => countMap(ownedCardIds), [ownedCardIds])
  const friendComposerCounts = useMemo(() => countMap(friendCardIds), [friendCardIds])
  const incomingTrades = trades.filter((t) => t.pendingUserId === myId)
  const outgoingTrades = trades.filter((t) => t.pendingUserId !== myId)
  const selectedFriend = friends.find((f) => f.friendId === selectedFriendId)

  return (
    <div className="max-w-3xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1>Trades</h1>
        <div className="relative">
          <button
            onClick={() => {
              if (composerOpen) {
                setComposerOpen(false)
                setSelectedFriendId(null)
              } else {
                setFriendPickerOpen((o) => !o)
              }
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
              composerOpen
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            <PlusIcon size={14} />
            New Trade
          </button>
          {friendPickerOpen && !composerOpen && (
            <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-lg py-1 min-w-40 z-50">
              {friends.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">No friends yet</p>
              ) : (
                friends.map((f) => (
                  <button
                    key={f.friendId}
                    onClick={() => { setFriendPickerOpen(false); openComposerForFriend(f.friendId) }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    {f.username}
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {composerOpen && selectedFriend && (
        <section className="rounded-xl border border-border p-5 bg-muted/20">
          <p className="text-sm font-semibold mb-4">
            Trade with <span className="text-accent">{selectedFriend.username}</span>
          </p>
          {loadingFriendCards ? (
            <div className="flex justify-center py-10">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <TradeComposer
              myCards={myCards}
              friendCards={allCards.filter((c) => friendCardIds.includes(c.id))}
              friendLabel={`${selectedFriend.username} gives`}
              onSubmit={handleSendTrade}
              onCancel={() => { setComposerOpen(false); setSelectedFriendId(null) }}
              submitLabel="Send Trade"
              loading={submittingTrade}
              myCounts={myCardCounts}
              friendCounts={friendComposerCounts}
            />
          )}
        </section>
      )}

      {incomingTrades.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-muted-foreground">Incoming</h2>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent text-primary text-xs font-bold">
              {incomingTrades.length}
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <ul className="space-y-3">
            {incomingTrades.map((trade) => (
              <IncomingTradeCard
                key={trade.id}
                trade={trade}
                allCards={allCards}
                myCards={myCards}
                myId={myId}
                myCardCounts={myCardCounts}
                onAccept={() => handleAccept(trade.id)}
                onCounter={(mySelected, friendSelected) =>
                  handleCounter(trade.id, mySelected, friendSelected)
                }
                onReject={() => handleReject(trade.id)}
                isLoading={actionLoadingId === trade.id}
              />
            ))}
          </ul>
        </section>
      )}

      {outgoingTrades.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-muted-foreground">Outgoing</h2>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <ul className="space-y-3">
            {outgoingTrades.map((trade) => {
              const myTradeCardIds = (
                trade.initiatorId === myId ? trade.initiatorCards : trade.recipientCards
              ).map((i) => i.cardId)
              const theirCardIds = (
                trade.initiatorId === myId ? trade.recipientCards : trade.initiatorCards
              ).map((i) => i.cardId)
              const theirUsername =
                trade.initiatorId === myId ? trade.recipientUsername : trade.initiatorUsername
              const isLoading = actionLoadingId === trade.id

              return (
                <li key={trade.id} className="rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-5 space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">
                      To <span className="text-foreground">{theirUsername}</span>
                      <span className="ml-2 text-xs font-normal">— waiting for response</span>
                    </p>
                    <TradeSlotDisplay label="You offer" cardIds={myTradeCardIds} allCards={allCards} />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border/40" />
                      <ArrowLeftRightIcon size={16} className="text-muted-foreground/50 shrink-0" />
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                    <TradeSlotDisplay label="You want" cardIds={theirCardIds} allCards={allCards} />
                    <button
                      disabled={isLoading}
                      onClick={() => handleCancel(trade.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                      {isLoading ? (
                        <div className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      ) : (
                        <XIcon size={13} />
                      )}
                      Cancel
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {trades.length === 0 && !composerOpen && tradeHistory.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-12">
          No active trades. Start one by clicking &quot;New Trade&quot;!
        </p>
      )}

      {tradeHistory.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-muted-foreground">History</h2>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <ul className="space-y-3">
            {tradeHistory.map((trade) => {
              const myTradeCardIds = (
                trade.initiatorId === myId ? trade.initiatorCards : trade.recipientCards
              ).map((i) => i.cardId)
              const theirCardIds = (
                trade.initiatorId === myId ? trade.recipientCards : trade.initiatorCards
              ).map((i) => i.cardId)
              const theirUsername =
                trade.initiatorId === myId ? trade.recipientUsername : trade.initiatorUsername
              const acceptedDate = new Date(trade.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })

              return (
                <li
                  key={trade.id}
                  className="rounded-xl border border-border/50 overflow-hidden opacity-70"
                >
                  <div className="px-5 py-5 space-y-5">
                    <p className="text-sm font-semibold text-muted-foreground">
                      With <span className="text-foreground">{theirUsername}</span>
                      <span className="ml-2 text-xs font-normal text-muted-foreground/70">
                        — {acceptedDate}
                      </span>
                    </p>
                    <TradeSlotDisplay label="You gave" cardIds={myTradeCardIds} allCards={allCards} />
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-border/40" />
                      <ArrowLeftRightIcon size={16} className="text-muted-foreground/30 shrink-0" />
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                    <TradeSlotDisplay label="You received" cardIds={theirCardIds} allCards={allCards} />
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {acceptedTrade && (
        <TradeCompleteModal
          giving={acceptedTrade.giving}
          receiving={acceptedTrade.receiving}
          onClose={() => {
            setAcceptedTrade(null)
            loadData()
          }}
        />
      )}
    </div>
  )
}

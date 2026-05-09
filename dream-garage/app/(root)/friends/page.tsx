'use client'
import { useEffect, useState } from 'react'
import {
  UserPlusIcon,
  CheckIcon,
  XIcon,
  UserXIcon,
  ChevronDownIcon,
  Repeat2Icon
} from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Modal from '@/components/ui/modal'
import { toast } from 'sonner'
import { card, getCards } from '@/app/_cards/repo'
import {
  FriendInfo,
  sendFriendRequest,
  getFriendRequests,
  respondToFriendRequest,
  getFriends,
  removeFriend,
  getFriendDreamGarage
} from '@/app/_friends/repo'

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

type RemoveTarget = {
  friendshipId: number
  friendId: number
  username?: string
}

export default function FriendsPage() {
  const router = useRouter()

  // Add friend form
  const [addFriendOpen, setAddFriendOpen] = useState(false)
  const [searchUsername, setSearchUsername] = useState('')
  const [sendingRequest, setSendingRequest] = useState(false)

  // Friends and requests data
  const [friends, setFriends] = useState<FriendInfo[]>([])
  const [pendingRequests, setPendingRequests] = useState<FriendInfo[]>([])
  const [sentRequests, setSentRequests] = useState<FriendInfo[]>([])

  // All cards loaded once for garage display
  const [allCards, setAllCards] = useState<card[]>([])

  // Collapsed friends (all expanded by default)
  const [collapsedIds, setCollapsedIds] = useState<Set<number>>(new Set())
  const [loadingGarageIds, setLoadingGarageIds] = useState<Set<number>>(
    new Set()
  )
  const [friendGarages, setFriendGarages] = useState<Record<number, card[]>>({})

  // Remove confirmation
  const [removeTarget, setRemoveTarget] = useState<RemoveTarget | null>(null)

  async function loadAllGarages(friendsList: FriendInfo[], cards: card[]) {
    const ids = friendsList.map((f) => f.friendId)
    setLoadingGarageIds(new Set(ids))

    await Promise.all(
      friendsList.map(async (friend) => {
        const data = await getFriendDreamGarage(friend.friendId)
        const garageCards = data
          ? data.dreamGarage
              .map((id) => cards.find((c) => c.id === id))
              .filter((c): c is card => c !== undefined)
          : []
        setFriendGarages((prev) => ({
          ...prev,
          [friend.friendId]: garageCards
        }))
        setLoadingGarageIds((prev) => {
          const next = new Set(prev)
          next.delete(friend.friendId)
          return next
        })
      })
    )
  }

  useEffect(() => {
    async function loadInitialData() {
      const [friendsList, requestsList, cards] = await Promise.all([
        getFriends(),
        getFriendRequests(),
        getCards()
      ])
      setFriends(friendsList)
      setPendingRequests(requestsList.incoming)
      setSentRequests(requestsList.outgoing)
      setAllCards(cards)
      loadAllGarages(friendsList, cards)
    }
    loadInitialData()
  }, [])

  async function loadFriendsData() {
    const [friendsList, requestsList] = await Promise.all([
      getFriends(),
      getFriendRequests()
    ])
    setFriends(friendsList)
    setPendingRequests(requestsList.incoming)
    setSentRequests(requestsList.outgoing)
    const newFriends = friendsList.filter((f) => !friendGarages[f.friendId])
    if (newFriends.length > 0) loadAllGarages(newFriends, allCards)
  }

  function handleToggleCollapse(friendId: number) {
    setCollapsedIds((prev) => {
      const next = new Set(prev)
      next.has(friendId) ? next.delete(friendId) : next.add(friendId)
      return next
    })
  }

  async function handleSendRequest() {
    if (!searchUsername.trim()) return
    setSendingRequest(true)
    const error = await sendFriendRequest(searchUsername.trim())
    setSendingRequest(false)
    if (error) {
      toast.error(error)
    } else {
      toast.success(`Friend request sent to ${searchUsername}`)
      setSearchUsername('')
      setAddFriendOpen(false)
    }
  }

  async function handleRespondToRequest(
    friendshipId: number,
    action: 'accept' | 'reject' | 'cancel'
  ) {
    const sendAction = action === 'accept' ? action : 'reject'
    const success = await respondToFriendRequest(friendshipId, sendAction)
    if (!success) {
      toast.error('Something went wrong')
      return
    }
    setPendingRequests((prev) =>
      prev.filter((r) => r.friendshipId !== friendshipId)
    )
    setSentRequests((prev) =>
      prev.filter((r) => r.friendshipId !== friendshipId)
    )
    if (action === 'accept') {
      await loadFriendsData()
      toast.success('Friend request accepted')
    } else if (action === 'reject') {
      toast.success('Friend request declined')
    } else {
      toast.success('Friend request cancelled')
    }
  }

  async function handleConfirmRemove() {
    if (!removeTarget) return
    const { friendshipId, friendId, username } = removeTarget
    setRemoveTarget(null)

    const success = await removeFriend(friendshipId)
    if (!success) {
      toast.error('Something went wrong')
      return
    }
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId))
    setFriendGarages((prev) => {
      const next = { ...prev }
      delete next[friendId]
      return next
    })
    toast.success(`Removed ${username}`)
  }

  return (
    <div className="max-w-2xl mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1>Friends</h1>
        <button
          onClick={() => setAddFriendOpen((o) => !o)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
            addFriendOpen
              ? 'bg-primary text-primary-foreground border-primary'
              : 'border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          <UserPlusIcon size={14} />
          Add Friend
        </button>
      </div>
      {addFriendOpen && (
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            handleSendRequest()
          }}
        >
          <Input
            placeholder="Enter username..."
            value={searchUsername}
            onChange={(e) => setSearchUsername(e.currentTarget.value)}
            autoFocus
          />
          <Button
            type="submit"
            disabled={sendingRequest || !searchUsername.trim()}
          >
            {sendingRequest ? (
              <div className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
            ) : (
              'Send'
            )}
          </Button>
        </form>
      )}
      {(pendingRequests.length > 0 || sentRequests.length > 0) && (
        <section className="space-y-3">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-muted-foreground">
              Requests
            </h2>
            <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-accent text-primary text-xs font-bold">
              {pendingRequests.length + sentRequests.length}
            </span>
            <div className="flex-1 h-px bg-border/60" />
          </div>
          <ul className="space-y-2">
            {pendingRequests.map((req) => (
              <li
                key={req.friendshipId}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30"
              >
                <span className="font-medium">{req.requesterUsername}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleRespondToRequest(req.friendshipId, 'accept')
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                  >
                    <CheckIcon size={14} />
                    Accept
                  </button>
                  <button
                    onClick={() =>
                      handleRespondToRequest(req.friendshipId, 'reject')
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <XIcon size={14} />
                    Decline
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <ul className="space-y-2">
            {sentRequests.map((req) => (
              <li
                key={req.friendshipId}
                className="flex items-center justify-between px-4 py-3 rounded-xl border border-border bg-muted/30"
              >
                <span className="font-medium">{req.addresseeUsername}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleRespondToRequest(req.friendshipId, 'cancel')
                    }
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                  >
                    <XIcon size={14} />
                    Cancel
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {friends.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-12">
          No friends yet. Add someone to see their dream garage!
        </p>
      ) : (
        <ul className="space-y-3">
          {friends.map((friend) => {
            const isCollapsed = collapsedIds.has(friend.friendId)
            const isLoadingGarage = loadingGarageIds.has(friend.friendId)
            const garageCards = friendGarages[friend.friendId] ?? []

            return (
              <li
                key={friend.friendshipId}
                className="rounded-xl border border-border overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
                  <button
                    onClick={() => handleToggleCollapse(friend.friendId)}
                    className="flex items-center gap-2 font-medium hover:text-foreground transition-colors flex-1 text-left"
                  >
                    <ChevronDownIcon
                      size={16}
                      className={`text-muted-foreground transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                    />
                    {friend.username}
                  </button>
                  <button
                    onClick={() => router.push(`/trades?friendId=${friend.friendId}`)}
                    className="p-1.5 rounded-md text-muted-foreground/40 hover:text-accent hover:bg-muted transition-colors"
                    aria-label={`Trade with ${friend.username}`}
                  >
                    <Repeat2Icon size={14} />
                  </button>
                  <button
                    onClick={() =>
                      setRemoveTarget({
                        friendshipId: friend.friendshipId,
                        friendId: friend.friendId,
                        username: friend.username
                      })
                    }
                    className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-muted transition-colors"
                    aria-label={`Remove ${friend.username}`}
                  >
                    <UserXIcon size={14} />
                  </button>
                </div>
                {!isCollapsed && (
                  <div className="px-4 py-6 bg-gradient-to-b from-muted/40 to-transparent border-t border-border/60">
                    {isLoadingGarage ? (
                      <div className="flex justify-center py-8">
                        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      </div>
                    ) : (
                      <>
                        <div className="flex gap-3 justify-center flex-wrap sm:flex-nowrap">
                          {garageCards.map((card) => (
                            <div
                              key={card.id}
                              className="relative shrink-0"
                              style={{ width: 120 }}
                            >
                              <span
                                className={`absolute -top-2.5 -right-2.5 z-10 h-7 w-7 flex items-center justify-center text-xs font-bold rounded-full shadow-md ${ratingBadgeClass[card.rating] ?? 'bg-muted text-foreground'}`}
                              >
                                {card.rating}
                              </span>
                              <div
                                className="relative w-full overflow-hidden rounded-xl shadow-lg"
                                style={{ aspectRatio: '5/7' }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
                                <div
                                  className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[card.rating] ?? 'bg-muted'}`}
                                />
                                <div className="absolute top-1 inset-x-0 bg-black/55 px-2 py-1.5">
                                  <span className="text-white font-semibold truncate block text-center text-xs">
                                    {card.name}
                                  </span>
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center p-2 pt-10 pb-2">
                                  <Image
                                    src={card.image}
                                    width={200}
                                    height={200}
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
                          {Array.from({ length: 5 - garageCards.length }).map(
                            (_, i) => (
                              <div
                                key={`empty-${i}`}
                                className="shrink-0 rounded-xl border-2 border-dashed border-border/30"
                                style={{ width: 120, aspectRatio: '5/7' }}
                              />
                            )
                          )}
                        </div>
                        {garageCards.length === 0 && (
                          <p className="text-xs text-muted-foreground text-center mt-4">
                            {friend.username} hasn&apos;t added any cars yet.
                          </p>
                        )}
                      </>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}

      {/* Remove friend confirmation */}
      <Modal
        showModal={removeTarget !== null}
        title="Remove Friend"
        onClose={() => setRemoveTarget(null)}
      >
        <div className="space-y-4 text-center">
          <p className="text-muted-foreground text-sm">
            Remove{' '}
            <span className="font-semibold text-foreground">
              {removeTarget?.username}
            </span>{' '}
            from your friends? You will no longer be able to see their dream
            garage.
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setRemoveTarget(null)}
              className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmRemove}
              className="px-4 py-2 rounded-lg bg-destructive text-white text-sm font-medium hover:bg-destructive/90 transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

'use client'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CardGrid } from '@/components/garage/cardGrid'
import { DreamGarageSection } from '@/components/garage/dreamGarageSection'
import Modal from '@/components/ui/modal'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { StarIcon, CurrencyIcon } from 'lucide-react'
import { card, getCards, getOwnedCards, sellCard, getDreamGarage, updateDreamGarage } from '@/app/_cards/repo'
import { toast } from 'sonner'
import { pack, getPacks } from '@/app/_packs/repo'

const ratingPrice: Record<string, number> = {
  'S+': 2500,
  S: 1000,
  A: 500,
  B: 200,
  C: 75
}

const ratingBadgeClass: Record<string, string> = {
  'S+': 'bg-amber-400 text-primary',
  S: 'bg-[#FF70A6] text-white',
  A: 'bg-[#ff9770] text-primary',
  B: 'bg-[#5d536b] text-white',
  C: 'bg-[#272838] text-white'
}

export default function Home() {
  // Garage filter and navigation
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null)

  // Card data
  const [collectedCards, setCollectedCards] = useState<number[]>([])
  const [allCards, setAllCards] = useState<card[]>([])
  const [packs, setPacks] = useState<pack[]>([])

  // Card modal
  const [viewCard, setViewCard] = useState<card | null | undefined>(null)
  const [sellQuantity, setSellQuantity] = useState(1)

  // Dream garage
  const [dreamGarageIds, setDreamGarageIds] = useState<number[]>([])

  const searchParams = useSearchParams()

  const userString = localStorage?.getItem('user')
  const userObj = userString ? JSON.parse(userString) : {}
  const username = userObj.username

  useEffect(() => {
    async function loadData() {
      const [ownedCards, cards, packs, dreamIds] = await Promise.all([
        getOwnedCards(),
        getCards(),
        getPacks(),
        getDreamGarage()
      ])
      setCollectedCards(ownedCards)
      setAllCards(cards)
      setPacks([...packs].sort((a, b) => a.name.localeCompare(b.name)))
      setDreamGarageIds(dreamIds)
    }
    loadData()
  }, [])

  useEffect(() => {
    const packId = searchParams.get('pack')
    if (!packId || packs.length === 0 || allCards.length === 0) return
    setTimeout(() => {
      document
        .getElementById(`pack-section-${packId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }, [packs, allCards, searchParams])

  useEffect(() => {
    if (packs.length === 0) return

    function updateSelectedPack() {
      const stickyOffset = 150
      let currentPack: number | null = null

      for (const pack of packs) {
        const element = document.getElementById(`pack-section-${pack.id}`)
        if (!element) continue
        if (element.getBoundingClientRect().top <= stickyOffset) {
          currentPack = pack.id
        }
      }

      setSelectedPackId(currentPack)
    }

    window.addEventListener('scroll', updateSelectedPack, { passive: true })
    return () => window.removeEventListener('scroll', updateSelectedPack)
  }, [packs])

  function toggleOwnedfilter(checked: boolean) {
    setShowOnlyOwned(checked)
    if (selectedPackId !== null) {
      setTimeout(
        () =>
          document
            .getElementById(`pack-section-${selectedPackId}`)
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
        0
      )
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  function viewCardModal(id: number) {
    const card = allCards.find((card) => card.id == id)
    setViewCard(card)
  }

  function closeModal() {
    setViewCard(null)
    setSellQuantity(1)
  }

  async function handleSellDuplicate() {
    if (!viewCard) return
    const result = await sellCard(viewCard.id, sellQuantity)
    if (result) {
      setCollectedCards((prev) => {
        const next = [...prev]
        for (let i = 0; i < sellQuantity; i++) {
          const index = next.indexOf(viewCard.id)
          if (index !== -1) next.splice(index, 1)
        }
        return next
      })
      setSellQuantity(1)
      window.dispatchEvent(new CustomEvent('points-updated', { detail: { points: result.points } }))
      toast.success(`Sold ${sellQuantity} duplicate${sellQuantity > 1 ? 's' : ''} for +${result.pointsEarned}`)
    }
  }

  // Dream garage actions
  async function handleAddToDreamGarage(cardId: number) {
    if (dreamGarageIds.length >= 5 || dreamGarageIds.includes(cardId)) return
    const newIds = [...dreamGarageIds, cardId]
    setDreamGarageIds(newIds)
    await updateDreamGarage(newIds)
    toast.success('Added to dream garage')
  }

  async function handleRemoveFromDreamGarage(cardId: number) {
    const newIds = dreamGarageIds.filter((id) => id !== cardId)
    setDreamGarageIds(newIds)
    await updateDreamGarage(newIds)
    toast.success('Removed from dream garage')
  }

  async function handleReorderDreamGarage(newCardIds: number[]) {
    setDreamGarageIds(newCardIds)
    await updateDreamGarage(newCardIds)
  }

  const dreamCards = dreamGarageIds
    .map((id) => allCards.find((c) => c.id === id))
    .filter((c): c is card => c !== undefined)

  const isInDreamGarage = viewCard ? dreamGarageIds.includes(viewCard.id) : false
  const canAddToDreamGarage = viewCard
    ? collectedCards.includes(viewCard.id) && !isInDreamGarage && dreamGarageIds.length < 5
    : false

  return (
    <div>
      <h1 className="text-center py-6">{username}&apos;s Dream Garage</h1>

      {allCards.length > 0 && (
        <DreamGarageSection
          dreamCards={dreamCards}
          onRemove={handleRemoveFromDreamGarage}
          onReorder={handleReorderDreamGarage}
          onCardClick={viewCardModal}
        />
      )}

      <div className="flex items-center gap-3 mb-2">
        <h2 className="text-lg font-semibold text-muted-foreground">Collection</h2>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      {packs.length > 0 && (
        <div className="sticky top-14 z-30 relative mb-8">
          <div className="absolute w-screen left-1/2 -translate-x-1/2 inset-y-0 bg-white/60 backdrop-blur-md border-b border-border/40" />
          <div className="relative flex items-center gap-2 py-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1">
              {packs.map((pack) => (
                <button
                  key={pack.id}
                  onClick={() => {
                    setSelectedPackId(pack.id)
                    document
                      .getElementById(`pack-section-${pack.id}`)
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }}
                  className="shrink-0 px-4 py-1.5 rounded-full bg-muted text-xs font-bold uppercase tracking-wider text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors duration-200 cursor-pointer"
                >
                  {pack.name}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2 shrink-0 border-l border-border/40 pl-3">
              <Label
                htmlFor="show-only-owned"
                className="text-sm text-muted-foreground cursor-pointer"
              >
                Owned
              </Label>
              <Switch
                id="show-only-owned"
                checked={showOnlyOwned}
                onCheckedChange={(checked) => toggleOwnedfilter(checked)}
              />
            </div>
          </div>
        </div>
      )}

      <div className="space-y-10">
        {packs.map((item, index) => (
          <CardGrid
            key={index}
            packName={item.name}
            packItems={allCards}
            ownedItems={collectedCards}
            onlyOwned={showOnlyOwned}
            packId={item.id}
            cardClicked={(id: number) => viewCardModal(id)}
          />
        ))}
      </div>

      <Modal
        showModal={viewCard?.id != null}
        title="Car Details"
        onClose={() => closeModal()}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center justify-between w-full">
            <span
              className={`inline-flex items-center justify-center h-8 w-8 rounded-full text-sm font-bold ${ratingBadgeClass[viewCard?.rating ?? ''] ?? 'bg-muted text-foreground'}`}
            >
              {viewCard?.rating}
            </span>
            <h2 className="text-center">{viewCard?.name}</h2>
            <div className="w-8" />
          </div>

          <Image
            src={viewCard?.image ? viewCard.image : ''}
            width={280}
            height={280}
            alt={`Car ${viewCard?.name}`}
            className="rounded-lg"
          />

          <div className="w-full grid grid-cols-2 gap-3 text-sm">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Top Speed</p>
              <p className="font-semibold">{viewCard?.topSpeed} MPH</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Horsepower</p>
              <p className="font-semibold">{viewCard?.horsepower}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Handling</p>
              <div className="flex gap-0.5 mt-0.5">
                {Array.from({ length: viewCard?.handling ?? 0 }).map((_, i) => (
                  <StarIcon
                    className="text-accent"
                    size={16}
                    key={i}
                    fill="currentColor"
                  />
                ))}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Engine</p>
              <p className="font-semibold">{viewCard?.engine}</p>
            </div>
          </div>

          {viewCard && collectedCards.includes(viewCard.id) && (() => {
            const hasDuplicates = collectedCards.filter((id) => id === viewCard.id).length > 1
            const maxSellable = collectedCards.filter((id) => id === viewCard.id).length - 1
            const garageFull = !canAddToDreamGarage && !isInDreamGarage && dreamGarageIds.length >= 5

            return (
              <div className="w-full space-y-2">
                <div className="flex gap-2 flex-wrap justify-center">
                  {canAddToDreamGarage && (
                    <button
                      onClick={() => handleAddToDreamGarage(viewCard.id)}
                      className="px-3 py-2 rounded-md border border-border text-sm font-medium hover:bg-muted transition-colors"
                    >
                      Add to Dream Garage
                    </button>
                  )}
                  {isInDreamGarage && (
                    <button
                      onClick={() => { handleRemoveFromDreamGarage(viewCard.id); closeModal() }}
                      className="px-3 py-2 rounded-md border border-border text-sm font-medium text-muted-foreground hover:bg-muted transition-colors"
                    >
                      Remove from Dream Garage
                    </button>
                  )}
                  {hasDuplicates && (
                    <div className="border border-border rounded-md px-3 py-1.5 flex items-center gap-2">
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        Sell
                        <span className="text-accent font-semibold flex items-center gap-0.5">
                          +{ratingPrice[viewCard.rating] * sellQuantity}
                          <CurrencyIcon size={12} />
                        </span>
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setSellQuantity((q) => Math.max(1, q - 1))}
                          className="h-6 w-6 rounded border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors disabled:opacity-40"
                          disabled={sellQuantity <= 1}
                        >
                          −
                        </button>
                        <span className="w-4 text-center text-sm font-semibold">{sellQuantity}</span>
                        <button
                          onClick={() => setSellQuantity((q) => Math.min(maxSellable, q + 1))}
                          className="h-6 w-6 rounded border border-border flex items-center justify-center text-sm hover:bg-muted transition-colors disabled:opacity-40"
                          disabled={sellQuantity >= maxSellable}
                        >
                          +
                        </button>
                        <button
                          onClick={handleSellDuplicate}
                          className="px-2.5 py-1 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                          Sell
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {garageFull && (
                  <p className="text-xs text-muted-foreground text-center">Dream garage is full (5/5)</p>
                )}
              </div>
            )
          })()}
        </div>
      </Modal>
    </div>
  )
}

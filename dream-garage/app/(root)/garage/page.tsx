'use client'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CardGrid } from '@/components/garage/cardGrid'
import Modal from '@/components/ui/modal'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { StarIcon } from 'lucide-react'
import { card, getCards, getOwnedCards } from '@/app/_cards/repo'
import { pack, getPacks } from '@/app/_packs/repo'

const ratingBadgeClass: Record<string, string> = {
  'S+': 'bg-amber-400 text-primary',
  S: 'bg-[#FF70A6] text-white',
  A: 'bg-[#ff9770] text-primary',
  B: 'bg-[#5d536b] text-white',
  C: 'bg-[#272838] text-white'
}

export default function Home() {
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [selectedPackId, setSelectedPackId] = useState<number | null>(null)
  const [viewCard, setViewCard] = useState<card | null | undefined>(null)
  const [collectedCards, setCollectedCards] = useState<number[]>([])
  const [allCards, setAllCards] = useState<card[]>([])
  const [packs, setPacks] = useState<pack[]>([])

  const searchParams = useSearchParams()

  const userString = localStorage?.getItem('user')
  const userObj = userString ? JSON.parse(userString) : {}
  const username = userObj.username

  useEffect(() => {
    async function loadAndSetCards() {
      const ownedCards = await getOwnedCards()
      setCollectedCards(ownedCards)

      const cards = await getCards()
      setAllCards(cards)
    }

    async function loadAndSetPacks() {
      const packs = await getPacks()
      setPacks([...packs].sort((a, b) => a.name.localeCompare(b.name)))
    }

    loadAndSetCards()
    loadAndSetPacks()
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
  }

  return (
    <div>
      <h1 className="text-center py-6">{username}&apos;s Garage</h1>

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
        </div>
      </Modal>
    </div>
  )
}

'use client'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import { toast } from 'sonner'
import Image from 'next/image'
import { CurrencyIcon } from 'lucide-react'
import { pack, getPacks, purchasePack } from '@/app/_packs/repo'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Modal from '@/components/ui/modal'
import { card } from '../_cards/repo'
import { Button } from '@/components/ui/button'

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

const ratingMap: Record<string, number> = {
  'S+': 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1
}

export default function Home() {
  const router = useRouter()
  const [allPacks, setAllPacks] = useState<pack[]>([])
  const [featuredPacks, setFeaturedPacks] = useState<pack[]>([])
  const [packOpened, setPackOpened] = useState<boolean>(false)
  const [packOpening, setPackOpening] = useState<boolean>(false)
  const [packResults, setPackResults] = useState<card[]>([])
  const [openedPackId, setOpenedPackId] = useState<number | null>(null)

  useEffect(() => {
    async function loadAndSetPacks() {
      const packs = await getPacks()
      const sortedPacks = packs.sort((a, b) => (a.name > b.name ? 1 : -1))
      setAllPacks(sortedPacks)
      setFeaturedPacks(packs.filter((p) => p.featured))
    }
    loadAndSetPacks()
  }, [])

  async function openPack(id: number, price: number) {
    const res = await purchasePack(id, price)
    if (typeof res === 'string') {
      toast.error(res, { position: 'top-center' })
    } else {
      setPackResults(
        res.sort((a, b): number => {
          if (ratingMap[a.rating] > ratingMap[b.rating]) return 1
          if (ratingMap[a.rating] < ratingMap[b.rating]) return -1
          return 0
        })
      )
      setOpenedPackId(id)
      setPackOpened(true)
      setPackOpening(true)
      setTimeout(() => setPackOpening(false), 800)
    }
  }

  return (
    <div>
      <div className="py-8 text-center">
        <h1>Featured Packs</h1>
        <p className="text-muted-foreground text-sm mt-2">
          Open packs to discover new cars
        </p>
      </div>

      <div className="flex justify-center pb-12">
        <Carousel className="w-full max-w-[14rem]" opts={{ loop: true }}>
          <CarouselContent viewportClassName="py-5">
            {featuredPacks.map((item, index) => (
              <CarouselItem key={index}>
                <div className="px-4 pb-1">
                  <PackCard
                    item={item}
                    onClick={() => openPack(item.id, item.price)}
                    size="lg"
                  />
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <h2 className="shrink-0">All Packs</h2>
        <div className="flex-1 h-px bg-border" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
        {allPacks.map((item, index) => (
          <PackCard
            key={index}
            item={item}
            onClick={() => openPack(item.id, item.price)}
            size="md"
          />
        ))}
      </div>

      <Modal
        showModal={packOpened}
        title="Pack Opened"
        onClose={() => location.reload()}
      >
        {packOpening ? (
          <div className="flex flex-col items-center justify-center py-14 gap-5">
            <div className="relative h-16 w-16">
              <div className="absolute inset-0 rounded-full border-4 border-accent/20" />
              <div className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin" />
            </div>
            <p className="text-muted-foreground text-sm tracking-widest uppercase animate-pulse">
              Opening pack…
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-5 gap-4 mb-5">
              {packResults.map((item, index) => (
                <div
                  key={index}
                  className="relative animate-card-reveal"
                  style={{ animationDelay: `${index * 0.15}s` }}
                >
                  <span
                    className={`absolute -top-2 -right-2 z-10 h-7 w-7 flex items-center justify-center text-xs font-bold rounded-full shadow-sm ${ratingBadgeClass[item.rating] ?? 'bg-muted text-foreground'}`}
                  >
                    {item.rating}
                  </span>

                  <div
                    className="relative w-full overflow-hidden rounded-xl shadow-md"
                    style={{ aspectRatio: '5/7' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />
                    <div
                      className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[item.rating] ?? 'bg-muted'}`}
                    />
                    <div className="absolute top-1 inset-x-0 bg-black/55 px-2 py-1.5">
                      <span
                        className="text-white font-semibold truncate block text-center"
                        style={{ fontSize: '0.6rem' }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center p-2 pt-9 pb-2">
                      <Image
                        src={item.image}
                        width={200}
                        height={200}
                        alt={item.name}
                        style={{
                          objectFit: 'contain',
                          maxWidth: '100%',
                          maxHeight: '100%',
                          height: 'auto'
                        }}
                        className="drop-shadow-lg"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <Button
                className="rounded-xl"
                onClick={() => router.push(`/garage?pack=${openedPackId}`)}
              >
                Go to garage
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}

function PackCard({
  item,
  onClick,
  size
}: {
  item: pack
  onClick: () => void
  size: 'md' | 'lg'
}) {
  return (
    <div
      className="relative cursor-pointer group select-none w-full"
      onClick={onClick}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl shadow-lg
                    transition-all duration-300 ease-out
                    group-hover:-translate-y-3 group-hover:rotate-1
                    group-hover:shadow-[0_24px_60px_rgba(39,40,56,0.45)]"
        style={{ aspectRatio: '5/8' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-[#1a1b2e] via-[#5d536b] to-[#1a1b2e]" />

        <div
          className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/12 to-white/0
                      opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        />

        <div className="absolute top-0 inset-x-0 bg-[#1a1b2e]/95 px-3 py-2 border-b border-white/10">
          <p
            className="text-white font-black uppercase tracking-[0.18em] text-center truncate"
            style={{ fontSize: size === 'lg' ? '0.65rem' : '0.6rem' }}
          >
            {item.name}
          </p>
        </div>

        <div className="absolute top-8 inset-x-4 border-t border-dashed border-white/20" />

        <div className="absolute inset-x-0 top-10 bottom-11 flex items-center justify-center p-3">
          <Image
            src={item.image}
            width={220}
            height={220}
            alt={item.name}
            style={{ objectFit: 'contain', maxWidth: '100%', height: 'auto' }}
            className="drop-shadow-2xl"
          />
        </div>

        <div className="absolute bottom-11 inset-x-0 text-center">
          <span
            className="text-white/15 font-bold uppercase tracking-[0.3em]"
            style={{ fontSize: '0.55rem' }}
          >
            Dream Garage
          </span>
        </div>

        <div className="absolute bottom-0 inset-x-0 bg-accent px-3 py-2">
          <div className="flex items-center justify-between">
            <span
              className="text-primary font-black uppercase tracking-wide"
              style={{ fontSize: '0.65rem' }}
            >
              Open
            </span>
            <div
              className="flex items-center gap-1 text-primary font-bold"
              style={{ fontSize: size === 'lg' ? '0.8rem' : '0.7rem' }}
            >
              <span>{item.price}</span>
              <CurrencyIcon size={11} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

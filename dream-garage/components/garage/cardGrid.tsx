import Image from 'next/image'

type packItem = {
  name: string
  image: string
  rating: string
  topSpeed: number
  horsepower: number
  handling: number
  packId: number
  id: number
  numberOwned?: number
}

type gridProps = {
  packName: string
  packItems: Array<packItem>
  ownedItems: Array<number>
  onlyOwned: boolean
  packId: number
  cardClicked: (id: number) => void
}

const ratingMap: Record<string, number> = {
  'S+': 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1
}

// Badge bg class only — used for both the badge and the top accent stripe
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

export function CardGrid({
  packName,
  packItems,
  ownedItems,
  onlyOwned,
  packId,
  cardClicked
}: gridProps) {
  if (onlyOwned) {
    packItems = packItems.filter((packItem) => ownedItems.includes(packItem.id))
  }

  packItems = packItems
    .filter((packItem) => packItem.packId == packId)
    .map((pack) => {
      const cardsOwned =
        ownedItems?.reduce((acc, cardId) => {
          return pack.id == cardId ? (acc += 1) : acc
        }, 0) || 0
      return { ...pack, numberOwned: cardsOwned }
    })
    .sort((a: packItem, b: packItem): number => {
      if (ratingMap[a.rating] > ratingMap[b.rating]) return -1
      if (ratingMap[a.rating] < ratingMap[b.rating]) return 1
      return 0
    })

  if (!packItems.length) return null

  return (
    <div id={`pack-section-${packId}`} className="scroll-mt-28">
      <div className="flex items-center gap-3 mb-4">
        <h3>{packName}</h3>
        <div className="flex-1 h-px bg-border/60" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {packItems.map((item, index) => {
          const isOwned = ownedItems?.includes(item.id)
          return (
            <div key={index} className="relative group">
              <span
                className={`absolute -top-2 -right-2 z-10 h-7 w-7 flex items-center justify-center text-xs font-bold rounded-full shadow-sm ${ratingBadgeClass[item.rating] ?? 'bg-muted text-foreground'}`}
              >
                {item.rating}
              </span>

              <div
                className={`relative w-full overflow-hidden rounded-xl shadow-md
                            transition-all duration-300 ease-out
                            ${isOwned ? 'cursor-pointer group-hover:-translate-y-2 group-hover:rotate-1 group-hover:shadow-xl group-hover:shadow-primary/30' : 'opacity-55'}`}
                style={{ aspectRatio: '5/7' }}
                onClick={() => (isOwned ? cardClicked(item.id) : null)}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-[#272838] via-[#3a3352] to-[#272838]" />

                <div
                  className={`absolute top-0 inset-x-0 h-1 ${ratingStripeClass[item.rating] ?? 'bg-muted'}`}
                />

                <div className="absolute top-1 inset-x-0 bg-black/55 px-2 py-1.5">
                  {isOwned ? (
                    <span
                      className="text-white font-semibold truncate block text-center"
                      style={{ fontSize: '0.6rem' }}
                    >
                      {item.name}
                    </span>
                  ) : (
                    <span
                      className="text-white/20 text-center block"
                      style={{ fontSize: '0.6rem' }}
                    >
                      —
                    </span>
                  )}
                </div>

                {isOwned && (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/8 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                )}

                {isOwned ? (
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
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center pt-7">
                    <span className="text-4xl font-bold text-white/20">?</span>
                  </div>
                )}
              </div>

              {item.numberOwned && item.numberOwned > 1 ? (
                <span className="absolute -bottom-2 -left-2 z-10 h-6 w-6 flex items-center justify-center text-xs font-bold bg-secondary text-white rounded-full shadow-sm">
                  {item.numberOwned}
                </span>
              ) : null}
            </div>
          )
        })}
      </div>
    </div>
  )
}

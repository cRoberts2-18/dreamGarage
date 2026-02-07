import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
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

const ratingMap: any = {
  'S+': 5,
  S: 4,
  A: 3,
  B: 2,
  C: 1
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
      const cardsOwned = ownedItems.reduce((acc, cardId) => {
        return pack.id == cardId ? (acc += 1) : acc
      }, 0)
      return { ...pack, numberOwned: cardsOwned }
    })
    .sort((a: packItem, b: packItem): number => {
      if (ratingMap[a.rating] > ratingMap[b.rating]) return -1
      if (ratingMap[a.rating] < ratingMap[b.rating]) return 1
      if (ratingMap[a.rating] == ratingMap[b.rating]) return 0
      return 0
    })

  if (!packItems.length) return <div></div>

  return (
    <div>
      <h3 className="ps-3 mb-5">{packName}</h3>
      <div className="grid grid-cols-6 gap-4 px-2">
        {packItems.map((item, index) => (
          <div
            key={index}
            className="relative transition delay-50 duration-300 ease-in-out hover:scale-102 "
          >
            <span className="absolute -top-2 -right-3 p-2 bg-accent rounded-full">
              {item.rating}
            </span>
            <Card
              className="h-80"
              onClick={() =>
                ownedItems.includes(item.id) ? cardClicked(item.id) : null
              }
            >
              {!ownedItems.includes(item.id) ? (
                <CardContent className="flex aspect-square items-center justify-center pt-10">
                  <span className="text-4xl font-semibold">?</span>
                </CardContent>
              ) : (
                <CardContent className="text-center p-0">
                  <span className="font-semibold">{item.name}</span>
                  <div className="flex aspect-square items-center">
                    <Image
                      className="pt-2"
                      src={item.image}
                      width={250}
                      height={100}
                      alt={`Pack Image for ${item.name}`}
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {item.numberOwned && item?.numberOwned > 1 ? (
              <span className="absolute -bottom-2 -right-3 p-2 bg-accent rounded-full">
                {item.numberOwned}
              </span>
            ) : (
              ''
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

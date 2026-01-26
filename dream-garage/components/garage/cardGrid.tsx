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
}

type gridProps = {
  packName: string
  packItems: Array<packItem>
  ownedItems: Array<number>
  onlyOwned: boolean
  packId: number
  cardClicked: (id: number) => void
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

  packItems = packItems.filter((packItem) => packItem.packId == packId)

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
            <span className="absolute -top-4 -right-3 p-2 bg-accent rounded-full">
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
          </div>
        ))}
      </div>
    </div>
  )
}

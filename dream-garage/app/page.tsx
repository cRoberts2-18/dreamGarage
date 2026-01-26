import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from '@/components/ui/carousel'
import Image from 'next/image'
import { CurrencyIcon } from 'lucide-react'

export default async function Home() {
  const featuredPacks = [
    {
      name: 'Supercars',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Hot hatches',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Track Monsters',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Offroaders',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'JDM Legends',
      image: '/placeholder.png',
      price: 600
    }
  ]

  const allPacks = [
    ...featuredPacks,
    {
      name: 'All-American Muscle',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Hybrid Heroes',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Roaring V12s',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Grand Tourers',
      image: '/placeholder.png',
      price: 600
    },
    {
      name: 'Budget Sports Cars',
      image: '/placeholder.png',
      price: 600
    }
  ].sort(function (a, b) {
    if (a.name > b.name) return 1
    if (a.name < b.name) return -1
    return 0
  })

  return (
    <div>
      <h1 className="my-5 text-center">Featured Packs</h1>
      <div className="flex justify-center">
        <Carousel className="w-full max-w-[25rem]">
          <CarouselContent>
            {featuredPacks.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-5">
                  <Card className="transition delay-150 duration-300 ease-in-out hover:scale-102 hover:shadow-md/30">
                    <CardHeader className="text-center">
                      <span className="font-semibold">{item.name}</span>
                    </CardHeader>
                    <CardContent className="flex aspect-square items-center justify-center px-0">
                      <Image
                        src={item.image}
                        width={1500}
                        height={100}
                        alt={`Pack Image for ${item.name}`}
                      />
                    </CardContent>
                    <CardFooter className="flex justify-end">
                      <span className="font-semibold">{item.price}</span>
                      <CurrencyIcon size={15} className="ms-1" />
                    </CardFooter>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselNext />
          <CarouselPrevious />
        </Carousel>
      </div>
      <h2 className="ms-10 mt-10">All Packs</h2>
      <div className="grid grid-cols-4 gap-4 px-2">
        {allPacks.map((item, index) => (
          <div key={index}>
            <Card className="transition delay-50 duration-300 ease-in-out hover:scale-102 hover:shadow-md/30">
              <CardHeader className="text-center">
                <span className="font-semibold">{item.name}</span>
              </CardHeader>
              <CardContent className="flex aspect-square items-center justify-center px-0">
                {' '}
                <Image
                  src={item.image}
                  width={1000}
                  height={100}
                  alt={`Pack Image for ${item.name}`}
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <span className="font-semibold">{item.price}</span>
                <CurrencyIcon size={15} className="ms-1" />
              </CardFooter>
            </Card>
          </div>
        ))}
      </div>
    </div>
  )
}

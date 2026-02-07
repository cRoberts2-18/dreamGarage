'use client'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
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

export default function Home() {
  const router = useRouter()
  const [allPacks, setAllPacks] = useState<pack[]>([])
  const [featuredPacks, setFeaturedPacks] = useState<pack[]>([])
  const [packOpened, setPackOpened] = useState<boolean>(false)
  const [packResults, setPackResults] = useState<card[]>([])
  useEffect(() => {
    async function loadAndSetPacks() {
      const packs = await getPacks()

      const sortedPacks = packs.sort(function (a, b) {
        if (a.name > b.name) return 1
        if (a.name < b.name) return -1
        return 0
      })

      const featuredPacks = packs.filter((pack) => pack.featured == true)

      setAllPacks(sortedPacks)
      setFeaturedPacks(featuredPacks)
    }

    loadAndSetPacks()
  }, [])

  return (
    <div>
      <h1 className="my-5 text-center">Featured Packs</h1>
      <div className="flex justify-center">
        <Carousel className="w-full max-w-[25rem]">
          <CarouselContent>
            {featuredPacks.map((item, index) => (
              <CarouselItem key={index}>
                <div className="p-5">
                  <Card
                    className="transition delay-150 duration-300 ease-in-out hover:scale-102 hover:shadow-md/30 cursor-pointer"
                    onClick={async () => {
                      const res = await purchasePack(item.id, item.price)
                      if (typeof res === 'string')
                        toast.error(res, { position: 'top-center' })
                      else {
                        setPackOpened(true)
                        setPackResults(res)
                      }
                    }}
                  >
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
            <Card
              className="transition delay-50 duration-300 ease-in-out hover:scale-102 hover:shadow-md/30 cursor-pointer"
              onClick={async () => {
                const res = await purchasePack(item.id, item.price)
                if (typeof res === 'string')
                  toast.error(res, { position: 'top-center' })
                else {
                  setPackOpened(true)
                  setPackResults(res)
                }
              }}
            >
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

      <Modal
        showModal={packOpened}
        title="Pack"
        onClose={() => location.reload()}
      >
        <div className="grid grid-cols-5 gap-4 px-2 h-95 flex align-middle">
          {packResults.map((item, index) => (
            <div
              key={index}
              className="relative transition delay-50 duration-300 ease-in-out hover:scale-102 top-1/4"
            >
              <span className="absolute -top-2 -right-3 p-2 bg-accent rounded-full">
                {item.rating}
              </span>
              <Card>
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
              </Card>
            </div>
          ))}
        </div>

        <div className="flex justify-end">
          <Button
            className="z-50 mb-1 me-1 rounded-xl"
            onClick={() => {
              router.push('/garage')
            }}
          >
            Go to garage
          </Button>
        </div>
      </Modal>
    </div>
  )
}

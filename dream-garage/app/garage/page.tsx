'use client'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { CardGrid } from '@/components/garage/cardGrid'
import Modal from '@/components/ui/modal'
import { useState } from 'react'
import Image from 'next/image'
import { StarIcon } from 'lucide-react'

type card = {
  name: string
  image: string
  rating: string
  topSpeed: number
  horsepower: number
  handling: number
  engine: string
  packId: number
  id: number
}

type pack = {
  id: number
  name: string
}

export default function Home() {
  const [showOnlyOwned, setShowOnlyOwned] = useState(false)
  const [viewCard, setViewCard] = useState<card | null | undefined>(null)
  const collectedCars: Array<card> = [
    {
      name: 'BMW M3 GTR',
      image: '/placeholder.png',
      rating: 'S+',
      topSpeed: 174,
      horsepower: 500,
      handling: 4,
      engine: '4.0L Naturally aspirated V8',
      packId: 1,
      id: 1
    }
  ]

  const packs: Array<pack> = [
    {
      name: 'Hot hatches',
      id: 1
    },
    {
      name: 'Track Monsters',
      id: 2
    },
    {
      name: 'Supercars',
      id: 3
    },
    {
      name: 'Offroaders',
      id: 4
    },
    {
      name: 'JDM Legends',
      id: 5
    }
  ]

  const tempPack: Array<card> = Array.from({ length: 100 }).map(
    (item, index) => {
      const car = collectedCars[0]

      return { ...car, id: index, packId: (index % 5) + 1 }
    }
  )

  function toggleOwnedfilter(checked: boolean) {
    setShowOnlyOwned(checked)
  }

  function viewCardModal(id: number) {
    const card = tempPack.find((card) => card.id == id)
    setViewCard(card)
  }

  function closeModal() {
    setViewCard(null)
  }

  return (
    <div>
      <div className="w-full flex justify-between">
        <div className="w-35"></div>
        <h1 className="text-center">Username Garage</h1>
        <div className="w-35 flex items-center space-x-2">
          <Switch
            id="show-only-owned"
            checked={showOnlyOwned}
            onCheckedChange={(checked) => toggleOwnedfilter(checked)}
          />
          <Label htmlFor="show-only-owned">Owned Cars</Label>
        </div>
      </div>
      {packs.map((item, index) => (
        <div key={index}>
          <CardGrid
            packName={item.name}
            packItems={tempPack}
            ownedItems={[1]}
            onlyOwned={showOnlyOwned}
            packId={item.id}
            cardClicked={(id: number) => viewCardModal(id)}
          />
        </div>
      ))}
      <Modal
        showModal={viewCard?.id != null}
        title="view car"
        onClose={() => closeModal()}
      >
        <div className="flex justify-between px-10">
          <div className="w-10"></div>
          <h2 className="text-center">{viewCard?.name}</h2>
          <div className="w-10 text-end">{viewCard?.rating}</div>
        </div>
        <div className="flex justify-between px-10">
          <div>Top Speed: {viewCard?.topSpeed}MPH</div>
          <div>Horsepower: {viewCard?.topSpeed}</div>
        </div>
        <div className="flex justify-center">
          <Image
            className="pt-2"
            src={viewCard?.image ? viewCard.image : ''}
            width={250}
            height={250}
            alt={`Pack Image for ${viewCard?.name}`}
          />
        </div>
        <div className="flex justify-between px-10">
          <div className="flex">
            <span className="pe-1">Handling:</span>{' '}
            {Array.from({
              length: viewCard?.handling ? viewCard.handling : 0
            }).map((_, index) => (
              <StarIcon className="mt-1 text-accent" size={20} key={index} />
            ))}
          </div>
          <div className="w-45 flex">
            <span className="pe-1">Engine: </span>{' '}
            <span>{viewCard?.engine}</span>
          </div>
        </div>
      </Modal>
    </div>
  )
}

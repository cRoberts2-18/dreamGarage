'use client'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import Link from 'next/link'
import { ToolboxIcon, CarIcon, CurrencyIcon, CheckIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList
} from '@/components/ui/navigation-menu'

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from '@/components/ui/tooltip'
import { useEffect, useState } from 'react'
import { updatePoints } from '../_user/repo'
import Modal from '@/components/ui/modal'
import { Card, CardContent } from '@/components/ui/card'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const path = usePathname()
  const userString = localStorage?.getItem('user')
  const userObj = userString ? JSON.parse(userString) : {}
  const [user, setUser] = useState(userObj)

  const [dailyModal, setDailyModal] = useState<boolean>(false)

  useEffect(() => {
    async function checkPoints() {
      const userString = localStorage?.getItem('user')
      const userObj = userString ? JSON.parse(userString) : {}
      if (userObj != user) {
        setUser(userObj)
      }

      const lastActive = user.last_active
        ? new Date(new Date(user.last_active).toDateString())
        : null
      const now = new Date()

      if (lastActive) {
        const difference = now.getTime() - lastActive.getTime()
        const days = Math.floor(difference / (1000 * 3600 * 24))

        if (days === 1) {
          setDailyModal(true)
        }
        if (days > 1) {
          setUser({ ...user, streak: 1 })
          setDailyModal(true)
        }
      } else {
        setDailyModal(true)
      }
    }

    checkPoints()
  }, [path])

  const isGarage = path === '/garage'
  const isShop = path === '/'

  return (
    <div>
      <header className="sticky top-0 z-40 w-full bg-white/60 backdrop-blur-md border-b border-border/40">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 py-3">
          <div className="w-32">
            <Image src="/dg.png" alt="Dream Garage logo" height={32} width={32} />
          </div>
          <NavigationMenu>
            <NavigationMenuList className="gap-1">
              <NavigationMenuItem>
                <NavigationMenuLink className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/garage"
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isGarage
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <CarIcon size={16} />
                        <span>Garage</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Garage</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink className="p-0 bg-transparent hover:bg-transparent focus:bg-transparent">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/"
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          isShop
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                        }`}
                      >
                        <ToolboxIcon size={16} />
                        <span>Shop</span>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Shop</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="w-32 flex justify-end items-center gap-1.5 text-sm font-semibold">
            <span>{user.points}</span>
            <CurrencyIcon size={16} className="text-accent" />
          </div>
        </div>
      </header>

      <Modal
        showModal={dailyModal}
        onClose={() => setDailyModal(false)}
        title="Daily Bonus"
      >
        <div className="grid grid-cols-4 gap-2 p-2">
          {Array.from({ length: 7 }, (v, k) => k + 1).map((item, index) => (
            <Card
              key={index}
              className={`h-30 ${item == user.streak ? 'cursor-pointer' : 'backdrop-blur-xs'}`}
              onClick={async () => {
                if (item == user.streak) {
                  const newUser = await updatePoints(
                    parseInt(user.points) + 500 * item,
                    user.id,
                    user.streak === 7 ? 1 : user.streak + 1
                  )
                  setUser(newUser)
                  setDailyModal(false)
                } else {
                }
              }}
            >
              <div>
                <CardContent className="flex items-center justify-center flex-col z-15">
                  <span className="font-semibold mb-2 mt-0">Day {item}</span>
                  <span>
                    <div>{500 * item}</div>
                  </span>
                  {item < user.streak ? (
                    <div className="absolute inset-2 flex justify-center items-center z-10 backdrop-blur-xs text-green-400 text-lg">
                      <CheckIcon size="55" />
                    </div>
                  ) : (
                    ''
                  )}
                </CardContent>
              </div>
            </Card>
          ))}
        </div>
      </Modal>

      <main className="max-w-7xl mx-auto px-4 pb-12">
        {children}
      </main>
    </div>
  )
}

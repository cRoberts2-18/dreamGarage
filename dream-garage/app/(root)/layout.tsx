'use client'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import Link from 'next/link'
import { HomeIcon, CarIcon, FlagIcon, CurrencyIcon } from 'lucide-react'
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
  const userString = localStorage.getItem('user')
  const userObj = userString ? JSON.parse(userString) : {}

  const [user, setUser] = useState(userObj)

  const [dailyModal, setDailyModal] = useState<boolean>(false)

  useEffect(() => {
    async function checkPoints() {
      const lastActive = new Date(new Date(user.last_active).toDateString())
      const now = new Date()

      const difference = now.getTime() - lastActive.getTime()
      const days = Math.floor(difference / (1000 * 3600 * 24))

      if (days === 1) {
        setDailyModal(true)
      }
      if (days > 1) {
        setDailyModal(true)
      }
    }

    checkPoints()
  })

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-full flex justify-between py-2">
          <div className="ps-3 w-45">{user.username}</div>
          <NavigationMenu>
            <NavigationMenuList className="w-full">
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/garage">
                        <CarIcon />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Garage</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/">
                        <HomeIcon />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Home</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link href="/race">
                        <FlagIcon />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Race</p>
                    </TooltipContent>
                  </Tooltip>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="font-size-sm w-45 flex justify-end align-middle pe-3">
            {user.points}
            <CurrencyIcon className="ms-2" />
          </div>
        </div>
        <Modal
          showModal={dailyModal}
          onClose={() => setDailyModal(false)}
          title="Daily Bonus"
        >
          <div className="grid grid-cols-4 gap-2 p-2">
            {Array.from({ length: 7 }, (v, k) => k + 1).map((item, index) => (
              <Card
                key={index}
                className="h-30"
                onClick={async () => {
                  if (item == user.streak) {
                    const newUser = await updatePoints(
                      parseInt(user.points) + 500 * item,
                      user.id
                    )
                    setUser(newUser)
                    setDailyModal(false)
                  } else {
                  }
                }}
              >
                <CardContent className="flex items-center justify-center flex-col">
                  <span className="font-semibold mb-2 mt-0">Day {item}</span>
                  <span>
                    <div>{500 * item}</div>
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </Modal>

        {children}
      </body>
    </html>
  )
}

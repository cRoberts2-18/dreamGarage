'use client'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import Link from 'next/link'
import {
  HomeIcon,
  CarIcon,
  FlagIcon,
  CurrencyIcon,
  CheckIcon
} from 'lucide-react'
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

  return (
    <div>
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

      <style jsx>{`
        .mask {
          background-color: red !important;
          filter: blur(10px);
        }
      `}</style>

      {children}
    </div>
  )
}

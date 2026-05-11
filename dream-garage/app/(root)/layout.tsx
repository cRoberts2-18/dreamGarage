'use client'
import { Geist, Geist_Mono } from 'next/font/google'
import '../globals.css'
import Link from 'next/link'
import { ToolboxIcon, CarIcon, CurrencyIcon, CheckIcon, ChevronDownIcon, LogOutIcon, UsersIcon, Repeat2Icon, FlagIcon } from 'lucide-react'
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList
} from '@/components/ui/navigation-menu'

import { useEffect, useRef, useState } from 'react'
import { updatePoints } from '../_user/repo'
import { getActiveTrades } from '../_trades/repo'
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [pendingTradeCount, setPendingTradeCount] = useState(0)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const logout = () => {
    localStorage.removeItem('access-token')
    localStorage.removeItem('user')
    document.location.href = '/login'
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    const handlePointsUpdated = (e: CustomEvent) => {
      setUser((prev: typeof userObj) => ({ ...prev, points: e.detail.points }))
    }
    window.addEventListener('points-updated', handlePointsUpdated as EventListener)
    return () => window.removeEventListener('points-updated', handlePointsUpdated as EventListener)
  }, [])

  useEffect(() => {
    const handleTradesUpdated = (e: CustomEvent) => setPendingTradeCount(e.detail.count)
    window.addEventListener('pending-trades-updated', handleTradesUpdated as EventListener)
    return () => window.removeEventListener('pending-trades-updated', handleTradesUpdated as EventListener)
  }, [])

  useEffect(() => {
    async function fetchTradeCount() {
      try {
        const userId = JSON.parse(localStorage.getItem('user') || '{}').id
        if (!userId) return
        const trades = await getActiveTrades()
        setPendingTradeCount(trades.filter((t) => t.pendingUserId === userId).length)
      } catch {}
    }
    fetchTradeCount()
  }, [])

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
  const isFriends = path.startsWith('/friends')
  const isTrades = path.startsWith('/trades')
  const isRace = path.startsWith('/race')

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
              </NavigationMenuItem>
              <NavigationMenuItem>
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
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/friends"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isFriends
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <UsersIcon size={16} />
                  <span>Friends</span>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/trades"
                  className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isTrades
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Repeat2Icon size={16} />
                  <span>Trades</span>
                  {pendingTradeCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-accent text-primary text-[10px] font-bold flex items-center justify-center leading-none">
                      {pendingTradeCount}
                    </span>
                  )}
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link
                  href="/race"
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isRace
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <FlagIcon size={16} />
                  <span>Race</span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
          <div className="flex justify-end" ref={userMenuRef}>
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen((o) => !o)}
                className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-sm font-semibold hover:bg-muted transition-colors"
              >
                <span>{user.points}</span>
                <CurrencyIcon size={16} className="text-accent" />
                <span className="ml-1 text-muted-foreground">{user.username}</span>
                <ChevronDownIcon size={14} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1 bg-background border border-border rounded-lg shadow-lg py-1 min-w-32 z-50">
                  <button
                    onClick={logout}
                    className="flex items-center gap-2 px-3 py-2 text-sm w-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <LogOutIcon size={14} />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
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

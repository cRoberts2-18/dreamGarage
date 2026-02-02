import type { Metadata } from 'next'
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

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin']
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin']
})

export const metadata: Metadata = {
  title: 'Dream Garage',
  description: 'Dream Garage'
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <div className="w-full flex justify-between py-2">
          <div className="ps-3 w-45">Logo</div>
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
            <span></span>
            1500
            <CurrencyIcon className="ms-2" />
          </div>
        </div>

        {children}
      </body>
    </html>
  )
}

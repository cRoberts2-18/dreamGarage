'use client'
import { useEffect, useRef, useState } from 'react'

type Props = {
  onComplete: () => void
}

export function RaceLights({ onComplete }: Props) {
  const [litCount, setLitCount] = useState(0)
  const [go, setGo] = useState(false)
  const [dark, setDark] = useState(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const lightUp = (n: number) => {
      setLitCount(n)
      if (n < 5) {
        timer = setTimeout(() => lightUp(n + 1), 400)
      } else {
        // All 5 lit — pause then go dark
        timer = setTimeout(() => {
          setDark(true)
          timer = setTimeout(() => {
            setGo(true)
            timer = setTimeout(() => onCompleteRef.current(), 600)
          }, 500)
        }, 500)
      }
    }

    timer = setTimeout(() => lightUp(1), 400)

    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-8 py-12">
      <div className="flex gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-10 h-10 rounded-full border-2 transition-all duration-150"
            style={{
              backgroundColor: dark
                ? 'transparent'
                : litCount > i
                  ? '#ef4444'
                  : 'transparent',
              borderColor: dark ? '#4b5563' : litCount > i ? '#ef4444' : '#4b5563',
              boxShadow: !dark && litCount > i ? '0 0 16px #ef4444' : 'none',
            }}
          />
        ))}
      </div>

      {go && (
        <p className="text-5xl font-black text-green-400 tracking-widest animate-pulse">GO!</p>
      )}
    </div>
  )
}

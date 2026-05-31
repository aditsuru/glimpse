"use client"

import React, { useEffect, useState } from "react"
import { cn } from "@/lib/client/utils"

interface MeteorsProps {
  number?: number
  minDuration?: number
  maxDuration?: number
  angle?: number
  className?: string
}

export const Meteors = ({
  number = 60,
  minDuration = 10,
  maxDuration = 20,
  angle = 210,
  className,
}: MeteorsProps) => {
  const [meteorStyles, setMeteorStyles] = useState<Array<React.CSSProperties>>([])

  useEffect(() => {
    const W = window.innerWidth
    const H = window.innerHeight

    const rad = ((angle - 180) * Math.PI) / 180
    const horizontalDrift = H * Math.tan(rad)

    const spawnWidth = W + Math.abs(horizontalDrift)
    const slotWidth = spawnWidth / number

    const styles = [...new Array(number)].map((_, i) => {
      const duration = Math.random() * (maxDuration - minDuration) + minDuration

      const left = i * slotWidth + Math.random() * slotWidth

      const delay = Math.random() * duration * -1

      return {
        "--angle": -angle + "deg",
        top: "-5%",
        left: `${left}px`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
      }
    })

    setMeteorStyles(styles)
  }, [number, minDuration, maxDuration, angle])

  return (
    <>
      {meteorStyles.map((style, idx) => (
        <span
          key={idx}
          style={style}
          className={cn(
            "animate-meteor pointer-events-none absolute size-0.5 rotate-(--angle) rounded-full bg-zinc-300 shadow-[0_0_0_1px_#ffffff10]",
            className
          )}
        >
          <div className="pointer-events-none absolute top-1/2 -z-10 h-px w-14 -translate-y-1/2 bg-linear-to-r from-zinc-300 to-transparent" />
        </span>
      ))}
    </>
  )
}
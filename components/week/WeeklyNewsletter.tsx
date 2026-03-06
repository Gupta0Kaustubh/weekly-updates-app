"use client"

import { Update } from "@/types"
import { useRef, useState, useEffect, forwardRef } from "react"
import MagazineContent from "./MagazineContent"

type Props = {
  updates: Update[]
  weekTitle?: string
}

// Forward ref so parent can access the container
const WeeklyNewsletter = forwardRef<HTMLDivElement, Props>(({ updates, weekTitle }, ref) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)

  const MIN_SCALE = 0.7
  const MAX_SCALE = 2.5

  // Merge forwarded ref
  const combinedRef = (node: HTMLDivElement) => {
    containerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  // Zoom logic (same as before) ...
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (!e.ctrlKey) return
      e.preventDefault()
      e.stopPropagation()
      setScale((prev) => Math.min(Math.max(prev - e.deltaY * 0.01, MIN_SCALE), MAX_SCALE))
    }
    window.addEventListener("wheel", handleWheel, { passive: false })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [])

  useEffect(() => {
    const element = containerRef.current
    if (!element) return

    let lastDistance: number | null = null

    const getDistance = (touches: TouchList) => {
      const dx = touches[0].clientX - touches[1].clientX
      const dy = touches[0].clientY - touches[1].clientY
      return Math.sqrt(dx * dx + dy * dy)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) return
      e.preventDefault()

      const distance = getDistance(e.touches)

      // Only update scale if lastDistance exists
      if (lastDistance !== null) {
        const delta = distance - lastDistance
        setScale((prev) =>
          Math.min(Math.max(prev + delta * 0.005, MIN_SCALE), MAX_SCALE)
        )
      }

      // Update lastDistance for next move
      lastDistance = distance
    }

    const handleTouchEnd = () => {
      lastDistance = null
    }

    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [])

  if (!updates.length) return <div>No stories published.</div>

  return (
    <div
      ref={combinedRef}
      className="h-full overflow-auto bg-gradient-to-br from-indigo-50 via-white to-amber-50 p-12 touch-none"
      onDoubleClick={() => setScale(1)}
    >
      <div
        style={{
          transform: `scale(${scale})`,
          transformOrigin: "center top",
          transition: "transform 0.05s linear",
        }}
      >
        <MagazineContent updates={updates} weekTitle={weekTitle} />
      </div>
    </div>
  )
})

export default WeeklyNewsletter
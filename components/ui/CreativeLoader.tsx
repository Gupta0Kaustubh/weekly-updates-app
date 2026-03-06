"use client"

import { useEffect, useState } from "react"

const colors = ["#f43f5e", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"]

export default function CreativeLoader({ text = "Loading..." }: { text?: string }) {
  const [activeColor, setActiveColor] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveColor(prev => (prev + 1) % colors.length)
    }, 400)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[100vh] space-y-4">
      <div className="flex space-x-3">
        {colors.map((color, idx) => (
          <span
            key={idx}
            className={`w-4 h-4 rounded-full animate-bounce`}
            style={{
              backgroundColor: color,
              animationDelay: `${idx * 0.2}s`,
              transform: idx === activeColor ? "scale(1.5)" : "scale(1)",
              transition: "transform 0.3s ease-in-out",
            }}
          ></span>
        ))}
      </div>
      <p className="text-gray-300 font-medium">{text}</p>
    </div>
  )
}
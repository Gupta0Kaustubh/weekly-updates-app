"use client"

import { ReactNode, forwardRef, HTMLAttributes } from "react"

type Props = {
  children: ReactNode
} & HTMLAttributes<HTMLDivElement>

const Card = forwardRef<HTMLDivElement, Props>(
  ({ children, className = "", ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          relative
          border border-gray-800
          bg-gray-900/80 backdrop-blur-sm
          p-6
          rounded-xl
          shadow-md
          hover:shadow-xl
          transition-all duration-200
          ${className}
        `}
        {...rest}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = "Card"

export default Card
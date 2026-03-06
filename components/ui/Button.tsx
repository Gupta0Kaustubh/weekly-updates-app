"use client"

import { ReactNode, ButtonHTMLAttributes } from "react"
import clsx from "clsx"

type Props = {
  children: ReactNode
  variant?: "primary" | "danger" | "secondary"
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export default function Button({
  children,
  variant = "primary",
  className,
  ...props
}: Props) {
  const baseClasses =
    "px-4 py-2 rounded font-semibold focus:outline-none focus:ring-2 focus:ring-offset-1 transition disabled:opacity-50"

  const variantClasses = clsx({
    "bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500":
      variant === "primary",
    "bg-red-600 hover:bg-red-700 text-white focus:ring-red-500":
      variant === "danger",
    "bg-gray-600 hover:bg-gray-700 text-white focus:ring-gray-500":
      variant === "secondary",
  })

  return (
    <button
      {...props}
      className={clsx(baseClasses, variantClasses, className)}
    >
      {children}
    </button>
  )
}
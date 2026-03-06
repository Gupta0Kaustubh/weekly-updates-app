"use client"

import { ReactNode } from "react"

type Props = {
  children: ReactNode
}

export default function Container({ children }: Props) {
  return <div className="min-h-screen bg-black text-white p-10">{children}</div>
}
"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Props = {
  weekId: string
}

export default function WeekBadge({ weekId }: Props) {
  const [week, setWeek] = useState<{
    start_date: string
    end_date: string
  } | null>(null)

  useEffect(() => {
    const fetchWeek = async () => {
      const { data } = await supabase
        .from("weeks")
        .select("start_date, end_date")
        .eq("id", weekId)
        .single()

      if (data) setWeek(data)
    }

    fetchWeek()
  }, [weekId])

  if (!week) return null

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })

  return (
    <div className="flex items-center gap-2 bg-gray-800 px-4 py-2 rounded-lg shadow">
      <span className="text-xl">📅</span>
      <div className="text-sm flex flex-row gap-2">
        <div className="font-semibold text-white">
          {formatDate(week.start_date)}
        </div>
        <div className="text-gray-400 text-xs text-center">to</div>
        <div className="font-semibold text-white">
          {formatDate(week.end_date)}
        </div>
      </div>
    </div>
  )
}
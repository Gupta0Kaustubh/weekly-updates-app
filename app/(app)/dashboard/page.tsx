"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"
import NewsletterCard from "./NewsletterCard"

type WeekCard = {
  id: string
  title: string
  start_date: string
  end_date: string
  updates: Update[]
}

export default function DashboardPage() {
  const [weeks, setWeeks] = useState<WeekCard[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewsletters = async () => {
      const { data, error } = await supabase
        .from("published_newsletters")
        .select(`
          position,
          weeks (
            id,
            title,
            start_date,
            end_date
          ),
          updates (
            id,
            title,
            description,
            image_url,
            submitted_by_name
          )
        `)
        .order("position", { ascending: true })

      if (error) {
        console.error(error)
        setLoading(false)
        return
      }

      const grouped: Record<string, WeekCard> = {}

      data.forEach((row: any) => {
        const week = row.weeks
        const update = row.updates

        if (!grouped[week.id]) {
          grouped[week.id] = {
            id: week.id,
            title: week.title,
            start_date: week.start_date,
            end_date: week.end_date,
            updates: []
          }
        }

        grouped[week.id].updates.push(update)
      })

      const sorted = Object.values(grouped).sort(
        (a, b) =>
          new Date(b.start_date).getTime() -
          new Date(a.start_date).getTime()
      )

      setWeeks(sorted)
      setLoading(false)
    }

    fetchNewsletters()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">

      {/* Header */}
      <div className="p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">
            Weekly Newsletters
          </h1>
          <p className="text-gray-400 mt-1">
            Browse published company updates
          </p>
        </div>

        <div className="text-sm text-gray-500">
          {weeks.length} Published
        </div>
      </div>

      {/* Content */}
      <div className="px-8 pb-10">

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="h-[220px] rounded-xl bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        )}

        {!loading && weeks.length === 0 && (
          <p className="text-gray-400">No newsletters published yet.</p>
        )}

        {!loading && weeks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {weeks.map((week) => (
              <NewsletterCard key={week.id} week={week} />
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
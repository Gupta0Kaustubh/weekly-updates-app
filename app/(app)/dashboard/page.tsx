"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"
import NewsletterCard from "./NewsletterCard"
import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown"

type WeekCard = {
  id: string
  title: string
  start_date: string
  end_date: string
  updates: Update[]
}

export default function DashboardPage() {
  const [weeks, setWeeks] = useState<WeekCard[]>([])
  const [allWeeks, setAllWeeks] = useState<WeekCard[]>([])
  const [loading, setLoading] = useState(true)

  const [profileNames, setProfileNames] = useState<string[]>([])
  const [selectedNames, setSelectedNames] = useState<string[]>([])

  // Multi-select filters for month and year
  const [months, setMonths] = useState<string[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  // Fetch newsletters and profiles
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
        (a, b) => new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )

      setWeeks(sorted)
      setAllWeeks(sorted)

      // Populate months and years from newsletter dates
      const monthSet = new Set<string>()
      const yearSet = new Set<string>()
      sorted.forEach((week) => {
        const date = new Date(week.start_date)
        monthSet.add(date.toLocaleString("default", { month: "long" }))
        yearSet.add(date.getFullYear().toString())
      })

      setMonths(Array.from(monthSet))
      setYears(Array.from(yearSet))

      setLoading(false)
    }

    const fetchProfiles = async () => {
      const { data, error } = await supabase.from("profiles").select("name")
      if (error) {
        console.error(error)
        return
      }
      if (data) setProfileNames(data.map((p: any) => p.name))
    }

    fetchNewsletters()
    fetchProfiles()
  }, [])

  // Combined filter: people + months + years
  useEffect(() => {
    let filtered = allWeeks

    // People filter
    if (selectedNames.length > 0) {
      filtered = filtered.filter((week) =>
        week.updates.some((update) =>
          selectedNames.some((name) => {
            const normalizedDescription = update.description?.replace(/\s+/g, "").toLowerCase()
            const fullName = name.replace(/\s+/g, "").toLowerCase()
            const firstName = name.split(" ")[0].toLowerCase()
            return normalizedDescription?.includes(fullName) || normalizedDescription?.includes(firstName)
          })
        )
      )
    }

    // Month filter
    if (selectedMonths.length > 0) {
      filtered = filtered.filter((week) => {
        const monthName = new Date(week.start_date).toLocaleString("default", { month: "long" })
        return selectedMonths.includes(monthName)
      })
    }

    // Year filter
    if (selectedYears.length > 0) {
      filtered = filtered.filter((week) => {
        const year = new Date(week.start_date).getFullYear().toString()
        return selectedYears.includes(year)
      })
    }

    setWeeks(filtered)
  }, [selectedNames, selectedMonths, selectedYears, allWeeks])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weekly Newsletters</h1>
          <p className="text-gray-400 mt-1">Browse published company updates</p>
        </div>
        <div className="text-sm text-gray-500">{weeks.length} Published</div>
      </div>

      {/* Filters */}
      <div className="px-8 pb-4 flex items-center gap-4 flex-wrap">
        {/* People filter */}
        <MultiSelectDropdown
          options={profileNames}
          selected={selectedNames}
          onChange={setSelectedNames}
          placeholder="Filter by people"
        />

        {/* Year filter */}
        <MultiSelectDropdown
          options={years}
          selected={selectedYears}
          onChange={setSelectedYears}
          placeholder="Filter by year"
        />

        {/* Month filter */}
        <MultiSelectDropdown
          options={months}
          selected={selectedMonths}
          onChange={setSelectedMonths}
          placeholder="Filter by month"
        />

        {(selectedNames.length > 0 || selectedMonths.length > 0 || selectedYears.length > 0) && (
          <button
            onClick={() => {
              setSelectedNames([])
              setSelectedMonths([])
              setSelectedYears([])
            }}
            className="text-sm text-gray-400 hover:text-white"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-8 pb-10">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[220px] rounded-xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && weeks.length === 0 && <p className="text-gray-400">No newsletters found.</p>}

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
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"
import { useProfiles } from "@/lib/hooks/useProfiles"
import { formatDescriptionToDisplay } from "@/lib/mentions"

export type WeekCard = {
  id: string
  title: string
  start_date: string
  end_date: string
  updates: Update[]
}

export function useDashboard() {
  const { profiles, loading: profilesLoading } = useProfiles()
  const [weeks, setWeeks] = useState<WeekCard[]>([])
  const [allWeeks, setAllWeeks] = useState<WeekCard[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedNames, setSelectedNames] = useState<string[]>([])
  const [searchText, setSearchText] = useState("")

  // Multi-select filters for month and year
  const [months, setMonths] = useState<string[]>([])
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])
  const [years, setYears] = useState<string[]>([])
  const [selectedYears, setSelectedYears] = useState<string[]>([])

  const profileNames = profiles.map((p) => p.name)

  // Fetch newsletters
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

    fetchNewsletters()
  }, [])

  // Combined filter: people + months + years
  useEffect(() => {
    let filtered = allWeeks

    // People filter
    if (selectedNames.length > 0 || searchText) {
      filtered = filtered.filter((week) =>
        week.updates.some((update) => {
          const displayDescription = formatDescriptionToDisplay(update.description, profiles)
          const normalizedDescription = displayDescription.replace(/\s+/g, "").toLowerCase()

          // Dropdown selection match
          const selectedMatch = selectedNames.some((name) => {
            const fullName = name.replace(/\s+/g, "").toLowerCase()
            const firstName = name.split(" ")[0].toLowerCase()
            return normalizedDescription?.includes(fullName) || normalizedDescription?.includes(firstName)
          })

          // Free text match
          const searchMatch = searchText
            ? normalizedDescription?.includes(searchText.replace(/\s+/g, "").toLowerCase())
            : false

          return selectedMatch || searchMatch
        })
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
  }, [selectedNames, selectedMonths, selectedYears, searchText, allWeeks, profiles])

  return {
    weeks,
    loading: loading || profilesLoading,
    profileNames,
    selectedNames,
    setSelectedNames,
    searchText,
    setSearchText,
    months,
    selectedMonths,
    setSelectedMonths,
    years,
    selectedYears,
    setSelectedYears,
  }
}

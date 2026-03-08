"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"

type Role = "admin" | "member"

export function useCurrentWeekUser() {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<Role>("member")
  const [weekId, setWeekId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      setLoading(true)

      const { data } = await supabase.auth.getUser()
      if (!data.user) {
        setLoading(false)
        return
      }

      setUser(data.user)

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", data.user.id)
        .single()

      if (profile?.role) setRole(profile.role)

      const today = new Date()
      const todayStr = new Date().toLocaleDateString("en-CA")

      let { data: week } = await supabase
        .from("weeks")
        .select("id")
        .lte("start_date", todayStr)
        .gte("end_date", todayStr)
        .limit(1)
        .single()

      if (!week) {
        const start = new Date(today)
        const day = today.getDay() || 7
        start.setDate(today.getDate() - day + 1)

        const end = new Date(start)
        end.setDate(start.getDate() + 6)

        const { data: newWeek } = await supabase
          .from("weeks")
          .insert({
            start_date: start.toISOString().split("T")[0],
            end_date: end.toISOString().split("T")[0],
          })
          .select("id")
          .single()

        week = newWeek
      }

      setWeekId(week?.id ?? null)
      setLoading(false)
    }

    init()
  }, [])

  return { user, role, weekId, loading }
}
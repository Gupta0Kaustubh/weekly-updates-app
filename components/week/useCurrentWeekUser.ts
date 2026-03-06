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

      const today = new Date().toISOString().split("T")[0]

      const { data: week } = await supabase
        .from("weeks")
        .select("id")
        .lte("start_date", today)
        .gte("end_date", today)
        .single()

      setWeekId(week?.id ?? null)
      setLoading(false)
    }

    init()
  }, [])

  return { user, role, weekId, loading }
}
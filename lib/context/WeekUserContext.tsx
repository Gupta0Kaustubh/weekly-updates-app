"use client"

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"

type Role = "admin" | "member"

export type WeekUserContextType = {
  user: any
  role: Role
  weekId: string | null
  loading: boolean
}

const WeekUserContext = createContext<WeekUserContextType | undefined>(undefined)

export function WeekUserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [role, setRole] = useState<Role>("member")
  const [weekId, setWeekId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // useRef persists across React Strict Mode's simulated unmount/remount cycle.
  // This ensures initWithUser() runs exactly once per real component mount,
  // even though Strict Mode runs effects twice in development.
  const initialized = useRef(false)

  const initWithUser = async (currentUser: any) => {
    if (initialized.current) return
    initialized.current = true

    try {
      setUser(currentUser)

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .single()

      if (profile?.role) setRole(profile.role)

      const todayStr = new Date().toLocaleDateString("en-CA")

      let { data: week } = await supabase
        .from("weeks")
        .select("id")
        .lte("start_date", todayStr)
        .gte("end_date", todayStr)
        .limit(1)
        .single()

      if (!week) {
        const today = new Date()
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
    } catch (err) {
      console.error("WeekUserProvider: failed to initialise session data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // 1. Reactive listener — fires if session changes (token refresh, sign-in, sign-out).
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === "SIGNED_OUT") {
          // Reset everything so the next login starts fresh.
          initialized.current = false
          setUser(null)
          setRole("member")
          setWeekId(null)
          setLoading(false)
          return
        }

        if (session?.user) {
          await initWithUser(session.user)
        } else {
          setLoading(false)
        }
      }
    )

    // 2. Immediate check — reads the local session cache, no network request.
    //    This resolves weekId synchronously on the first render in most cases.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        initWithUser(session.user)
      } else {
        setLoading(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <WeekUserContext.Provider value={{ user, role, weekId, loading }}>
      {children}
    </WeekUserContext.Provider>
  )
}

export function useWeekUser(): WeekUserContextType {
  const context = useContext(WeekUserContext)
  if (!context) {
    throw new Error("useWeekUser must be used within a WeekUserProvider")
  }
  return context
}

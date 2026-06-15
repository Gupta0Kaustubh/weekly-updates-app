"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { Profile } from "@/types"

type ProfilesContextType = {
  profiles: Profile[]
  loading: boolean
  profileMap: Map<string, string>
}

const ProfilesContext = createContext<ProfilesContextType | undefined>(undefined)

export function ProfilesProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    const fetchProfiles = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return
      }

      try {
        const response = await fetch("/api/profiles", {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        })

        if (response.ok && active) {
          const { profiles: data } = await response.json()
          if (data) {
            setProfiles(data as Profile[])
            setLoading(false)
          }
        }
      } catch (err) {
        console.error("Error calling profiles API:", err)
      }
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session) {
        await fetchProfiles()
      }
    })

    fetchProfiles()

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  const profileMap = new Map<string, string>()
  profiles.forEach((p) => {
    profileMap.set(p.id, p.name)
  })

  return (
    <ProfilesContext.Provider value={{ profiles, loading, profileMap }}>
      {children}
    </ProfilesContext.Provider>
  )
}

export function useProfiles() {
  const context = useContext(ProfilesContext)
  if (!context) {
    throw new Error("useProfiles must be used within a ProfilesProvider")
  }
  return context
}

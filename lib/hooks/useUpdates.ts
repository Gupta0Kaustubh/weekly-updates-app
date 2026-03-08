// hooks/useUpdates.ts
import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"

export const useUpdates = (weekId: string, onlyApproved = false, refreshKey?: number) => {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUpdates = async () => {
      setLoading(true)
      let query = supabase
        .from("updates")
        .select("*")
        .eq("week_id", weekId)
        .order("order_index", { ascending: true })

      if (onlyApproved) query = query.eq("status", "approved")

      const { data, error } = await query
      if (!error && data) setUpdates(data)
      setLoading(false)
    }

    loadUpdates()
  }, [weekId, onlyApproved, refreshKey])

  const approveUpdate = async (id: string) => {
    await supabase.from("updates").update({ status: "approved" }).eq("id", id)
    setUpdates(prev => prev.map(u => (u.id === id ? { ...u, status: "approved" } : u)))
  }

  const rejectUpdate = async (id: string) => {
    await supabase.from("updates").update({ status: "rejected" }).eq("id", id)
    setUpdates(prev => prev.map(u => (u.id === id ? { ...u, status: "rejected" } : u)))
  }

  const resetUpdate = async (id: string) => {
    const { error } = await supabase
      .from("updates")
      .update({ status: "pending" })
      .eq("id", id)

    if (error) {
      console.error(error)
      return
    }

    setUpdates(prev => {
      const updated: Update[] = prev.map(u =>
        u.id === id ? { ...u, status: "pending" as const } : u
      )

      if (onlyApproved) {
        return updated.filter(u => u.status === "approved")
      }

      return updated
    })
  }

  return { updates, loading, setUpdates, approveUpdate, rejectUpdate, resetUpdate }
}
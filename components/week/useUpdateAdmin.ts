"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"
import { arrayMove } from "@dnd-kit/sortable"

export function useUpdateAdmin(
  weekId: string,
  refreshKey?: number,
  onlyApproved?: boolean
) {
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

      if (onlyApproved) {
        query = query.eq("status", "approved")
      }

      const { data } = await query

      if (data) setUpdates(data)

      setLoading(false)
    }

    loadUpdates()
  }, [weekId, refreshKey, onlyApproved])

  const reorderUpdates = async (activeId: string, overId: string) => {
    const oldIndex = updates.findIndex(u => u.id === activeId)
    const newIndex = updates.findIndex(u => u.id === overId)

    const newUpdates = arrayMove(updates, oldIndex, newIndex)
    setUpdates(newUpdates)

    await Promise.all(
      newUpdates.map((update, index) =>
        supabase
          .from("updates")
          .update({ order_index: index })
          .eq("id", update.id)
      )
    )
  }

  const updateStatus = async (id: string, status: "approved" | "rejected") => {
    await supabase
      .from("updates")
      .update({ status })
      .eq("id", id)

    setUpdates(prev =>
      prev.map(u =>
        u.id === id ? { ...u, status } : u
      )
    )
  }

  return {
    updates,
    loading,
    reorderUpdates,
    updateStatus,
  }
}
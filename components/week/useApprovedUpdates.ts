"use client"

import { useEffect, useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"

export function useApprovedUpdates(weekId: string | null) {
  const [approvedUpdates, setApprovedUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(false)

  const fetchApprovedUpdates = useCallback(async () => {
    if (!weekId) return

    setLoading(true)

    const { data } = await supabase
      .from("updates")
      .select("*")
      .eq("week_id", weekId)
      .eq("status", "approved")
      .order("order_index", { ascending: true })

    if (data) setApprovedUpdates(data)

    setLoading(false)
  }, [weekId])

  useEffect(() => {
    fetchApprovedUpdates()
  }, [fetchApprovedUpdates])

  return {
    approvedUpdates,
    loading,
    refresh: fetchApprovedUpdates,
  }
}
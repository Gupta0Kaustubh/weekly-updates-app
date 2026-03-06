"use client"

import { useEffect, useState } from "react"
import { Update } from "@/types"
import { getUpdatesByWeek } from "@/services/updateService"
import { supabase } from "@/lib/supabase"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type Props = {
  weekId: string
  refreshKey: number
  onRefresh?: () => void
}

export default function UpdateAdminList({ weekId, refreshKey, onRefresh }: Props) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  const loadUpdates = async () => {
    setLoading(true)
    const data = await getUpdatesByWeek(weekId)
    setUpdates(data)
    setLoading(false)
  }

  useEffect(() => {
    loadUpdates()
  }, [weekId, refreshKey])

  const handleAction = async (updateId: string, status: "approved" | "rejected") => {
    setActionLoading(updateId)
    const { error } = await supabase
      .from("updates")
      .update({ status })
      .eq("id", updateId)

    setActionLoading(null)
    if (!error) {
      loadUpdates()
      onRefresh?.()
    } else {
      console.error(error)
    }
  }

  if (loading) return <p>Loading updates...</p>
  if (!updates.length) return <p>No updates yet.</p>

  return (
    <div>
      <h3 className="text-xl font-semibold mb-3">Admin: Approve/Reject Updates</h3>
      {updates.map((update) => (
        <Card key={update.id}>
          <strong className="text-white">{update.title}</strong>
          <p className="text-gray-300">{update.description}</p>
          <small className="text-gray-400">Status: {update.status}</small>
          <div className="flex gap-2 mt-2">
            <Button
              variant="primary"
              disabled={actionLoading === update.id || update.status === "approved"}
              onClick={() => handleAction(update.id, "approved")}
            >
              Approve
            </Button>
            <Button
              variant="danger"
              disabled={actionLoading === update.id || update.status === "rejected"}
              onClick={() => handleAction(update.id, "rejected")}
            >
              Reject
            </Button>
          </div>
        </Card>
      ))}
    </div>
  )
}
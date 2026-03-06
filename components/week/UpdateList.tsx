"use client"

import { useEffect, useState } from "react"
import { getUpdatesByWeek } from "@/services/updateService"
import { Update } from "@/types"
import Card from "../ui/Card"

type Props = {
  weekId: string
  refreshKey: number
}

export default function UpdateList({ weekId, refreshKey }: Props) {
  const [updates, setUpdates] = useState<Update[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUpdates = async () => {
      setLoading(true)
      const data = await getUpdatesByWeek(weekId)
      setUpdates(data)
      setLoading(false)
    }

    loadUpdates()
  }, [weekId, refreshKey])

  if (loading) return <p>Loading updates...</p>

  if (!updates.length) return <p>No updates yet.</p>

  return (
    <div>
      <h3>This Week's Updates</h3>
      {updates.map((update) => (
        <Card key={update.id}>
            <strong className="text-white">{update.title}</strong>
            <p className="text-gray-300">{update.description}</p>
            <small className="text-gray-400">Status: {update.status}</small>
        </Card>
        ))}
    </div>
  )
}
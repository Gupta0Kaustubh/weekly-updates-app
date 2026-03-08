"use client"

import UpdateForm from "@/components/week/UpdateForm"
import UpdateSortableAdminList from "@/components/week/UpdateSortableAdminList"
import WeekBadge from "@/components/ui/WeekBadge"
import { useCurrentWeekUser } from "@/components/week/useCurrentWeekUser"
import CreativeLoader from "@/components/ui/CreativeLoader"

export default function Updates() {
  const { user, role, weekId, loading } = useCurrentWeekUser()

  if (loading) return <CreativeLoader text={role === "member" ? "Fetching your form..." : "Fetching your updates..."}/>
  if (!user || !weekId) return <p>No active week found.</p>

  return (
    <div className="max-w-6xl mx-auto max-h-1">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Updates</h1>
        <WeekBadge weekId={weekId} />
      </div>

      {role === "member" && (
        <UpdateForm
          weekId={weekId}
          userId={user.id}
          userName={user.user_metadata?.full_name ?? ""}
        />
      )}

      {role === "admin" && (
        <UpdateSortableAdminList
          weekId={weekId}
          sortable={false}
        />
      )}

    </div>
  )
}
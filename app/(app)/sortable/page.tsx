"use client"

import { useRef } from "react"
import UpdateSortableAdminList from "@/components/week/UpdateSortableAdminList"
import WeeklyNewsletter from "@/components/week/WeeklyNewsletter"
import WeekBadge from "@/components/ui/WeekBadge"
import { useCurrentWeekUser } from "@/components/week/useCurrentWeekUser"
import { useApprovedUpdates } from "@/components/week/useApprovedUpdates"
import CreativeLoader from "@/components/ui/CreativeLoader"
import { SortableActions } from "./SortableActions"

export default function SortablePage() {
  const { role, weekId, loading } = useCurrentWeekUser()
  const { approvedUpdates, refresh } = useApprovedUpdates(weekId)
  const newsletterRef = useRef<HTMLDivElement>(null)

  if (loading) return <CreativeLoader text="Fetching your updates..." />
  if (role !== "admin") return <p className="text-red-500">Access Denied</p>
  if (!weekId) return <p>No active week found.</p>

  return (
    <div className="p-6 relative">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sortable Approved Updates</h1>
        <WeekBadge weekId={weekId} />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">

        {/* Left Side */}
        <div className="overflow-y-auto pr-10 border-r border-gray-800">
          <UpdateSortableAdminList
            weekId={weekId}
            onlyApproved
            onRefresh={refresh}
          />
        </div>

        {/* Right Side */}
        <div className="overflow-y-auto bg-gray-950 rounded-lg p-4 relative">
          <WeeklyNewsletter
            ref={newsletterRef}
            updates={approvedUpdates}
            weekTitle="This Week's Edition"
          />
        </div>

      </div>

      {/* Floating Buttons */}
      <SortableActions
        weekId={weekId}
        approvedUpdates={approvedUpdates}
        newsletterRef={newsletterRef}
      />
    </div>
  )
}
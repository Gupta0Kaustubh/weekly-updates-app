"use client"

import { useState } from "react"
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import SortableItem from "./SortableItem"
import { useUpdates } from "@/lib/hooks/useUpdates"
import { useSortableUpdates } from "@/lib/hooks/useSortableUpdates"

type Props = {
  weekId: string
  refreshKey?: number
  onRefresh?: () => void
  onlyApproved?: boolean
  sortable?: boolean
}

export default function UpdateSortableAdminList({
  weekId,
  refreshKey,
  onRefresh,
  onlyApproved = false,
  sortable = true,
}: Props) {
  const { updates, loading, setUpdates, approveUpdate, rejectUpdate } = useUpdates(
    weekId,
    onlyApproved,
    refreshKey
  )
  const { sensors, handleDragEnd } = useSortableUpdates(updates, setUpdates, onRefresh)
  const [confirmData, setConfirmData] = useState<{ id: string; type: "approve" | "reject" } | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  if (loading) return <p>Loading updates...</p>
  if (!updates.length) return <p>No updates yet.</p>

  return (
    <>
      {sortable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={event =>
            handleDragEnd(
              String(event.active.id), // cast to string
              String(event.over?.id || "")
            )
          }
        >
          <SortableContext items={updates.map(u => u.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-6">
              {updates.map(u => (
                <SortableItem
                  key={u.id}
                  update={u}
                  onAction={(id, type) => setConfirmData({ id, type })}
                  sortable={true}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="space-y-6">
          {updates.map(u => (
            <SortableItem
              key={u.id}
              update={u}
              onAction={(id, type) => setConfirmData({ id, type })}
              sortable={false}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!confirmData}
        title={`Are you sure you want to ${confirmData?.type} this update?`}
        confirmText={`Yes, ${confirmData?.type}`}
        cancelText="Cancel"
        loading={actionLoading}
        onCancel={() => setConfirmData(null)}
        onConfirm={async () => {
          if (!confirmData) return
          setActionLoading(true)
          if (confirmData.type === "approve") await approveUpdate(confirmData.id)
          else await rejectUpdate(confirmData.id)
          setActionLoading(false)
          setConfirmData(null)
        }}
      />
    </>
  )
}
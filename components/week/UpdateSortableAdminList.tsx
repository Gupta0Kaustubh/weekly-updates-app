"use client"

import { useState } from "react"
import { DndContext, closestCenter } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import ConfirmDialog from "@/components/ui/ConfirmDialog"
import SortableItem from "./SortableItem"
import { useUpdates } from "@/lib/hooks/useUpdates"
import { useSortableUpdates } from "@/lib/hooks/useSortableUpdates"
import EditUpdateDialog from "./EditUpdateDialog"

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

  const {
    updates,
    loading,
    setUpdates,
    approveUpdate,
    rejectUpdate,
    resetUpdate,
    updateUpdate
  } = useUpdates(weekId, onlyApproved, refreshKey)

  const { sensors, handleDragEnd } = useSortableUpdates(updates, setUpdates, onRefresh)

  const [confirmData, setConfirmData] = useState<{ id: string; type: "approve" | "reject" | "reset" } | null>(null)

  const [editData, setEditData] = useState<any | null>(null)

  const [actionLoading, setActionLoading] = useState(false)

  if (loading) return <p>Loading updates...</p>
  if (!updates.length) return <p>No updates yet.</p>

  return (
    <>
      {sortable ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={(event) =>
            handleDragEnd(
              String(event.active.id),
              String(event.over?.id || "")
            )
          }
        >
          <SortableContext
            items={updates.map(u => u.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-6">
              {updates.map(u => (
                <SortableItem
                  key={u.id}
                  update={u}
                  sortable
                  onAction={(id, type) => setConfirmData({ id, type })}
                  onEdit={() => setEditData(u)}
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
              sortable={false}
              onAction={(id, type) => setConfirmData({ id, type })}
              onEdit={() => setEditData(u)}
            />
          ))}
        </div>
      )}

      {/* CONFIRM DIALOG */}
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
          else if (confirmData.type === "reject") await rejectUpdate(confirmData.id)
          else if (confirmData.type === "reset") await resetUpdate(confirmData.id)

          onRefresh?.()

          setActionLoading(false)
          setConfirmData(null)
        }}
      />

      {/* EDIT DIALOG */}
      <EditUpdateDialog
        open={!!editData}
        update={editData}
        onCancel={() => setEditData(null)}
        onSave={async (data) => {
          await updateUpdate(editData.id, data)
          setEditData(null)
          onRefresh?.()
        }}
      />

    </>
  )
}
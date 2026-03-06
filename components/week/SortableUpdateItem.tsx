"use client"

import { Update } from "@/types"
import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

type Props = {
  update: Update
  sortable: boolean
  onAction: (id: string, type: "approve" | "reject") => void
}

export default function SortableUpdateItem({
  update,
  sortable,
  onAction,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({
    id: update.id,
    disabled: !sortable,
  })

  const style = sortable
    ? {
        transform: CSS.Transform.toString(transform),
        transition,
      }
    : undefined

  const statusStyles = {
    approved: "bg-green-500/20 text-green-400 border-green-500/40",
    pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    rejected: "bg-red-500/20 text-red-400 border-red-500/40",
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card className="overflow-hidden relative">

        <div
          className={`absolute top-4 right-4 px-3 py-1 text-xs font-semibold rounded-full border ${
            statusStyles[update.status as keyof typeof statusStyles]
          }`}
        >
          {update.status.toUpperCase()}
        </div>

        {sortable && (
          <div
            {...attributes}
            {...listeners}
            className="absolute left-4 top-4 cursor-grab active:cursor-grabbing text-gray-500"
          >
            ☰
          </div>
        )}

        <div className={sortable ? "pl-8" : ""}>
          <h3 className="text-lg font-semibold text-white mb-2">
            {update.title}
          </h3>

          <div className="mb-4 flex items-start gap-4">
            <div className="flex-1">
              <p className="text-gray-400 leading-relaxed whitespace-pre-line">
                {update.description}
              </p>
            </div>

            {update.image_url && (
              <div className="flex-shrink-0">
                <img
                  src={update.image_url}
                  alt="Update image"
                  className="w-36 h-36 object-cover rounded-lg border border-gray-800"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between items-center text-sm text-gray-400 border-t border-gray-800 pt-4">
            <span>
              Submitted by{" "}
              <span className="font-medium text-gray-200">
                {update.submitted_by_name ?? update.submitted_by}
              </span>
            </span>
          </div>

          {update.status === "pending" && (
            <div className="mt-5 flex justify-end gap-3">
              <Button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onAction(update.id, "reject")}
                className="bg-red-600 hover:bg-red-700"
              >
                Reject
              </Button>

              <Button
                onPointerDown={(e) => e.stopPropagation()}
                onClick={() => onAction(update.id, "approve")}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
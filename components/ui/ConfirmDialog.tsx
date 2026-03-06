"use client"

import Card from "@/components/ui/Card"
import Button from "@/components/ui/Button"

type ConfirmDialogProps = {
  open: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  loading?: boolean
}

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  loading = false,
}: ConfirmDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <Card className="p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>

        {description && (
          <p className="text-gray-300 mb-4">{description}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button onClick={onCancel}>
            {cancelText}
          </Button>

          <Button onClick={onConfirm} disabled={loading}>
            {loading ? "Processing..." : confirmText}
          </Button>
        </div>
      </Card>
    </div>
  )
}
"use client"

import { useState, useEffect } from "react"

type Props = {
  open: boolean
  update: any
  onCancel: () => void
  onSave: (data: { title: string; description: string }) => void
}

export default function EditUpdateDialog({ open, update, onCancel, onSave }: Props) {

  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    if (update) {
      setTitle(update.title || "")
      setDescription(update.description || "")
    }
  }, [update])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onCancel}
    >
      <div
        className="bg-gray-900 rounded-xl p-6 w-[500px] space-y-4"
        onClick={(e) => e.stopPropagation()}
      >

        <h2 className="text-lg font-semibold">Edit Update</h2>

        <input
          className="w-full bg-gray-800 p-2 rounded"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          className="w-full bg-gray-800 p-2 rounded h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-2">
          <button
            className="px-4 py-2 bg-gray-700 rounded"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 bg-indigo-600 rounded"
            onClick={() => onSave({ title, description })}
          >
            Save
          </button>
        </div>

      </div>
    </div>
  )
}
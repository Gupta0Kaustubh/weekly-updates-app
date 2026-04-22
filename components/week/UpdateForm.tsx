"use client"

import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { useUpdateSubmit } from "./useUpdateSubmit"

type Props = {
  weekId: string
  userId: string
  userName: string
  onSubmitted?: () => void
}

export default function UpdateForm(props: Props) {
  const {
    title,
    setTitle,
    description,
    setDescription,
    impactScore,
    setImpactScore,
    previewUrl,
    loading,
    success,
    handleImageChange,
    handleSubmit
  } = useUpdateSubmit(props)

  return (
    <Card className="max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">
            Submit Weekly Update
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Share your progress, wins, or impact from this week.
          </p>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Description</label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none text-white resize-none"
          />

          <p className="text-xs text-gray-500">
            💡 To mention someone, type <span className="text-indigo-400">@</span> before their name
            (example: <span className="text-indigo-400">@john</span>)
          </p>
        </div>

        {/* Image Upload */}
        <div className="space-y-3">
          <label className="text-sm text-gray-400">
            Image (optional)
          </label>

          {/* Clickable Upload Box */}
          <label className="block cursor-pointer border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-indigo-500 transition">
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                handleImageChange(e.target.files?.[0] || null)
              }
              className="hidden"
            />

            {!previewUrl ? (
              <div className="text-gray-400 text-sm">
                Click to upload an image
              </div>
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                className="max-h-80 mx-auto object-contain rounded-lg"
              />
            )}
          </label>
        </div>

        {/* Impact Score */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-400">
              Impact Score
            </label>
            <span className="text-sm font-semibold text-indigo-400">
              {impactScore}/10
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={10}
            value={impactScore}
            onChange={(e) =>
              setImpactScore(Number(e.target.value))
            }
            className="w-full accent-indigo-500 cursor-pointer"
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit Update"}
          </Button>
        </div>

        {success && (
          <div className="text-green-400 text-sm font-medium">
            ✅ Update submitted successfully!
          </div>
        )}
      </form>
    </Card>
  )
}
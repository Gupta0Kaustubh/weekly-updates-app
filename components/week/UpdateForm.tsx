"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import Button from "@/components/ui/Button"
import Card from "@/components/ui/Card"
import { v4 as uuidv4 } from "uuid"

type Props = {
  weekId: string
  userId: string
  userName: string
  onSubmitted?: () => void
}

export default function UpdateForm({
  weekId,
  userId,
  userName,
  onSubmitted,
}: Props) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [impactScore, setImpactScore] = useState<number>(5)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleImageChange = (file: File | null) => {
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSuccess(false)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      console.error("User not authenticated")
      setLoading(false)
      return
    }

    let imageUrl: string | null = null

    /* Upload image if provided */
    if (imageFile) {
      const fileExt = imageFile.name.split(".").pop()
      const fileName = `${uuidv4()}.${fileExt}`
      const filePath = `${user.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from("updates")
        .upload(filePath, imageFile)

      if (uploadError) {
        console.error("Image upload failed:", uploadError)
        setLoading(false)
        return
      }

      const { data } = supabase.storage
        .from("updates")
        .getPublicUrl(filePath)

      imageUrl = data.publicUrl
    }

    /* Insert update */
    const { error } = await supabase.from("updates").insert([
      {
        week_id: weekId,
        title,
        description,
        submitted_by: userId,
        submitted_by_name: userName,
        impact_score: impactScore,
        status: "pending",
        order_index: 0,
        image_url: imageUrl,
      },
    ])

    setLoading(false)

    if (error) {
      console.error("Error submitting update:", error)
      return
    }

    setTitle("")
    setDescription("")
    setImpactScore(5)
    setImageFile(null)
    setPreviewUrl(null)
    setSuccess(true)
    onSubmitted?.()

    setTimeout(() => setSuccess(false), 3000)
  }

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
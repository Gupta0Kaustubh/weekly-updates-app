import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"

type UseUpdateSubmitProps = {
  weekId: string
  userId: string
  userName: string
  onSubmitted?: () => void
}

export function useUpdateSubmit({ weekId, userId, userName, onSubmitted }: UseUpdateSubmitProps) {
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

  return {
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
  }
}

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { v4 as uuidv4 } from "uuid"
import { useProfiles } from "@/lib/hooks/useProfiles"
import { formatDescriptionToDb } from "@/lib/mentions"

type UseUpdateSubmitProps = {
  weekId: string
  userId: string
  userName: string
  onSubmitted?: () => void
}

export function useUpdateSubmit({ weekId, userId, userName, onSubmitted }: UseUpdateSubmitProps) {
  const { profiles } = useProfiles()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [impactScore, setImpactScore] = useState<number>(5)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [aiFeedback, setAiFeedback] = useState<string | null>(null)
  const [isAiChecking, setIsAiChecking] = useState(false)

  const handleImageChange = (file: File | null) => {
    if (!file) return
    setImageFile(file)
    setPreviewUrl(URL.createObjectURL(file))
  }

  const handleSubmit = async (e?: React.FormEvent, forceSubmit: boolean = false) => {
    if (e) e.preventDefault()
    
    // If not bypassing, check with AI first
    if (!forceSubmit) {
      setIsAiChecking(true)
      setAiFeedback(null)
      try {
        const res = await fetch("/api/analyze-update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, description }),
        })
        const analysis = await res.json()
        
        if (!analysis.worthMentioning) {
          setAiFeedback(analysis.reason || "This update might need more details.")
          setIsAiChecking(false)
          return // Stop submission and let user review the feedback
        }
      } catch (err) {
        console.error("Failed to analyze update", err)
        // Proceed with submission if AI fails
      }
      setIsAiChecking(false)
    }

    setLoading(true)
    setSuccess(false)
    setAiFeedback(null)

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

    const dbDescription = formatDescriptionToDb(description, profiles)

    /* Insert update */
    const { error } = await supabase.from("updates").insert([
      {
        week_id: weekId,
        title,
        description: dbDescription,
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
    handleSubmit,
    aiFeedback,
    isAiChecking,
    setAiFeedback
  }
}

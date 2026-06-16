import { RefObject } from "react"
import * as htmlToImage from "html-to-image"
import { supabase } from "@/lib/supabase"
import { Update } from "@/types"

type SortableActionsProps = {
  weekId: string | null;
  approvedUpdates: Update[];
  newsletterRef: RefObject<HTMLDivElement | null>;
}

export function SortableActions({ weekId, approvedUpdates, newsletterRef }: SortableActionsProps) {
  const handleDownload = async () => {
    if (!newsletterRef.current) return

    try {
      const newsletterDiv = newsletterRef.current
      const innerDiv = newsletterDiv.firstElementChild as HTMLElement

      // Temporarily reset zoom and overflow
      const prevScale = innerDiv.style.transform
      const prevOverflow = newsletterDiv.style.overflow
      innerDiv.style.transform = "scale(1)"
      newsletterDiv.style.overflow = "visible"

      // Set width and height to match full scrollable content
      newsletterDiv.style.height = `${innerDiv.scrollHeight}px`

      // Capture the image
      const dataUrl = await htmlToImage.toPng(newsletterDiv, { 
        cacheBust: true, // avoids cached images
        pixelRatio: 2    // higher resolution
      })

      // Restore styles
      innerDiv.style.transform = prevScale
      newsletterDiv.style.overflow = prevOverflow
      newsletterDiv.style.height = "100%"

      // Trigger download
      const link = document.createElement("a")
      link.download = `weekly_newsletter_full.png`
      link.href = dataUrl
      link.click()

    } catch (err) {
      console.error("Failed to download full newsletter image:", err)
    }
  }

  const handleShare = async () => {
    if (!newsletterRef.current) return

    try {
      const newsletterDiv = newsletterRef.current
      const innerDiv = newsletterDiv.firstElementChild as HTMLElement

      const prevScale = innerDiv.style.transform
      const prevOverflow = newsletterDiv.style.overflow
      newsletterDiv.style.overflow = "visible"
      innerDiv.style.transform = "scale(1)"
      newsletterDiv.style.height = `${innerDiv.scrollHeight}px`

      // Generate PNG as Data URL
      const dataUrl = await htmlToImage.toPng(newsletterDiv, { cacheBust: true, pixelRatio: 2 })

      innerDiv.style.transform = prevScale
      newsletterDiv.style.overflow = prevOverflow
      newsletterDiv.style.height = "100%"

      // Convert Data URL to base64
      const base64 = dataUrl.replace(/^data:image\/png;base64,/, "")

      // Send to API
      await fetch("/api/send-newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64,
          recipient: "kaustubhgupta9860@gmail.com",
        }),
      })

      alert("Newsletter sent successfully!")

    } catch (err) {
      console.error("Failed to share newsletter:", err)
      alert("Failed to send newsletter.")
    }
  }

  const handlePublish = async () => {
    if (!weekId) return

    try {
      // 1. Remove previous publish for this week
      await supabase
        .from("published_newsletters")
        .delete()
        .eq("week_id", weekId)

      // 2. Create rows from approved updates
      const rows = approvedUpdates.map((update, index) => ({
        week_id: weekId,
        update_id: update.id,
        position: index
      }))

      const { error } = await supabase
        .from("published_newsletters")
        .insert(rows)

      if (error) {
        console.error(error)
        alert("Failed to publish newsletter")
        return
      }

      // 3. Fetch the week title for the Teams notification card
      const { data: weekData } = await supabase
        .from("weeks")
        .select("title")
        .eq("id", weekId)
        .single()

      // 4. Notify mentioned users via Teams webhook (non-blocking)
      try {
        const notifyRes = await fetch("/api/notify-mentions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            approvedUpdates,
            weekTitle: weekData?.title ?? "This Week's Edition",
          }),
        })

        const notifyData = await notifyRes.json()

        if (notifyData.success) {
          alert(
            `✅ Newsletter published!\n\n🔔 Teams notification sent to ${notifyData.notifiedCount} mentioned member${notifyData.notifiedCount === 1 ? "" : "s"}: ${notifyData.names.join(", ")}`
          )
        } else if (notifyData.skipped) {
          // No mentions found or webhook not configured — not a failure
          alert(`✅ Newsletter published!\n\nℹ️ Teams notification skipped: ${notifyData.reason}`)
        } else {
          alert("✅ Newsletter published!\n\n⚠️ Teams notification could not be sent.")
        }
      } catch (notifyErr) {
        // Teams notification failure must never block the publish flow
        console.error("Teams notification failed:", notifyErr)
        alert("✅ Newsletter published!\n\n⚠️ Teams notification could not be sent.")
      }

    } catch (err) {
      console.error(err)
      alert("Error publishing newsletter")
    }
  }

  return (
    <div className="absolute bottom-[-28px] right-6 flex gap-3">
      <button
        onClick={handlePublish}
        className={`font-bold py-2 px-5 rounded-lg shadow-lg text-white
        ${approvedUpdates.length === 0 
          ? "bg-gray-500 cursor-not-allowed opacity-50" 
          : "bg-green-600 hover:bg-green-700"}
      `}
        disabled={approvedUpdates.length === 0}
      >
        Publish
      </button>

      <button
        onClick={handleDownload}
        className={`font-bold py-2 px-5 rounded-lg shadow-lg text-white
        ${approvedUpdates.length === 0 
          ? "bg-gray-500 cursor-not-allowed opacity-50" 
          : "bg-indigo-600 hover:bg-indigo-700"}
      `}
      disabled={approvedUpdates.length === 0}
      >
        Download
      </button>

      <button
        onClick={handleShare}
        className={`font-bold py-2 px-5 rounded-lg shadow-lg text-white
        ${approvedUpdates.length === 0 
          ? "bg-gray-500 cursor-not-allowed opacity-50" 
          : "bg-blue-600 hover:bg-blue-700"}
      `}
      disabled={approvedUpdates.length === 0}
      >
        Share
      </button>
    </div>
  )
}

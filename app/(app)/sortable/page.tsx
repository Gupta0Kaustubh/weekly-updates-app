"use client"

import { useRef } from "react"
import UpdateSortableAdminList from "@/components/week/UpdateSortableAdminList"
import WeeklyNewsletter from "@/components/week/WeeklyNewsletter"
import WeekBadge from "@/components/ui/WeekBadge"
import { useCurrentWeekUser } from "@/components/week/useCurrentWeekUser"
import { useApprovedUpdates } from "@/components/week/useApprovedUpdates"
import CreativeLoader from "@/components/ui/CreativeLoader"
import * as htmlToImage from "html-to-image"

export default function SortablePage() {
  const { role, weekId, loading } = useCurrentWeekUser()
  const { approvedUpdates, refresh } = useApprovedUpdates(weekId)
  const newsletterRef = useRef<HTMLDivElement>(null)

  if (loading) return <CreativeLoader text="Fetching your updates..." />
  if (role !== "admin") return <p className="text-red-500">Access Denied</p>
  if (!weekId) return <p>No active week found.</p>

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

  return (
    <div className="p-6 relative">

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Sortable Approved Updates</h1>
        <WeekBadge weekId={weekId} />
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">

        {/* Left Side */}
        <div className="overflow-y-auto pr-10 border-r border-gray-800">
          <UpdateSortableAdminList
            weekId={weekId}
            onlyApproved
            onRefresh={refresh}
          />
        </div>

        {/* Right Side */}
        <div className="overflow-y-auto bg-gray-950 rounded-lg p-4 relative">
          <WeeklyNewsletter
            ref={newsletterRef}
            updates={approvedUpdates}
            weekTitle="This Week's Chronicle"
          />
        </div>

      </div>

      {/* Floating Buttons */}
      <div className="fixed bottom-3 right-24 flex flex-row gap-3 z-50">
        {/* Publish */}
        <button
          onClick={() => alert("Publish clicked! (no action yet)")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
        >
          Publish
        </button>

        {/* Download */}
        <button
          onClick={handleDownload}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
        >
          Download
        </button>

        {/* Share */}
        <button
          onClick={handleShare}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
        >
          Share
        </button>
      </div>
    </div>
  )
}
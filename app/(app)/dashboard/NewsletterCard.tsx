"use client"

import { useState } from "react"
import MagazineContent from "@/components/week/MagazineContent"
import { Update } from "@/types"

type WeekCard = {
  id: string
  title: string
  start_date: string
  end_date: string
  updates: Update[]
}

export default function NewsletterCard({ week }: { week: WeekCard }) {

  const [open, setOpen] = useState(false)

  return (
    <>
      <div className="group relative rounded-xl border border-gray-800 bg-white/5 backdrop-blur-lg p-3 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 cursor-pointer">

        {/* Preview */}
        <div className="overflow-hidden rounded-md mb-2 h-[90px] bg-black">

          <div className="origin-top-left scale-[0.14] w-[1200px] pointer-events-none">
            <MagazineContent
              updates={week.updates.slice(0, 1)}
              weekTitle={week.title}
            />
          </div>

        </div>

        {/* Title */}
        {/* <h2 className="text-xs font-semibold leading-tight line-clamp-2">
          {week.title || "Weekly Newsletter"}
        </h2> */}

        {/* Dates */}
        <p className="text-[10px] text-gray-400 mt-1">
          {week.start_date} → {week.end_date}
        </p>

        {/* Updates */}
        <p className="text-[10px] text-gray-500">
          {week.updates.length} updates
        </p>

        {/* Button */}
        <button
          onClick={() => setOpen(true)}
          className="mt-2 w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-md transition-colors"
        >
          View Newsletter
        </button>

        {/* Glow */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 transition-opacity pointer-events-none"/>
      </div>


      {/* POPUP MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >

          {/* Prevent closing when clicking inside */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-xl max-w-[800px] max-h-[90vh] overflow-auto shadow-2xl"
          >
            <MagazineContent
              updates={week.updates}
              weekTitle={week.title}
            />
          </div>

        </div>
      )}

    </>
  )
}
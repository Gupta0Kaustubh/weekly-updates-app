"use client"

import { useState } from "react"
import MagazineContent from "@/components/week/MagazineContent"
import { Update, ThemeConfig } from "@/types"
import { Sparkles, RefreshCw, X, Palette } from "lucide-react"

type WeekCard = {
  id: string
  title: string
  start_date: string
  end_date: string
  updates: Update[]
}

const OCCASIONS = [
  { value: "general", label: "📰  General Newsletter" },
  { value: "achievement", label: "🏆  Individual Achievement" },
  { value: "project_completion", label: "🚀  Project Completion" },
  { value: "promotion", label: "📈  Promotion / New Role" },
  { value: "anniversary", label: "🎂  Work Anniversary" },
  { value: "team_milestone", label: "🎉  Team Milestone" },
]

export default function NewsletterCard({ week }: { week: WeekCard }) {
  const [open, setOpen] = useState(false)
  const [theme, setTheme] = useState<ThemeConfig | null>(null)
  const [occasion, setOccasion] = useState("general")
  const [customPrompt, setCustomPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState("")

  async function generateTheme() {
    setIsGenerating(true)
    setError("")
    try {
      const res = await fetch("/api/generate-theme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, prompt: customPrompt }),
      })
      const data = await res.json()
      if (data.theme) {
        setTheme(data.theme)
      } else {
        setError("Could not generate theme. Try again.")
      }
    } catch {
      setError("Request failed. Check your connection.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <>
      {/* ── Card ── */}
      <div className="group relative rounded-xl border border-gray-800 bg-white/5 backdrop-blur-lg p-3 transition-all duration-300 hover:border-indigo-500 hover:shadow-lg hover:shadow-indigo-500/20 hover:-translate-y-1 cursor-pointer">

        {/* Thumbnail preview */}
        <div className="overflow-hidden rounded-md mb-2 h-[90px] bg-black">
          <div className="origin-top-left scale-[0.14] w-[1200px] pointer-events-none">
            <MagazineContent
              updates={week.updates.slice(0, 1)}
              weekTitle={week.title}
              theme={theme ?? undefined}
            />
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-1">
          {week.start_date} → {week.end_date}
        </p>
        <p className="text-[10px] text-gray-500">{week.updates.length} updates</p>

        <button
          onClick={() => setOpen(true)}
          className="mt-2 w-full text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 py-1.5 rounded-md transition-colors"
        >
          View Newsletter
        </button>

        {/* Glow overlay */}
        <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 transition-opacity pointer-events-none" />
      </div>

      {/* ── Modal ── */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="flex gap-3 w-full max-w-[1200px] max-h-[90vh]"
          >

            {/* ── AI Theme Panel ── */}
            <div className="w-72 shrink-0 flex flex-col bg-gray-950 rounded-2xl border border-gray-800 overflow-hidden shadow-2xl">

              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <Sparkles size={15} className="text-indigo-400" />
                  <span className="text-sm font-semibold text-white">AI Theme</span>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  className="text-gray-500 hover:text-white transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Panel body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">

                {/* Occasion selector */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Occasion
                  </label>
                  <select
                    value={occasion}
                    onChange={(e) => setOccasion(e.target.value)}
                    className="w-full bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {OCCASIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>

                {/* Custom prompt */}
                <div>
                  <label className="block text-[11px] font-medium text-gray-400 mb-1.5 uppercase tracking-wider">
                    Style Prompt <span className="text-gray-600 normal-case">(optional)</span>
                  </label>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="e.g. warm gold tones, festive, bold headlines…"
                    className="w-full bg-gray-900 text-white text-xs rounded-lg px-3 py-2.5 border border-gray-700 focus:outline-none focus:border-indigo-500 resize-none h-[72px] placeholder:text-gray-600 transition-colors"
                  />
                </div>

                {/* Generate button */}
                <button
                  onClick={generateTheme}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/25"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw size={12} className="animate-spin" />
                      Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles size={12} />
                      {theme ? "Regenerate Theme" : "Generate Theme"}
                    </>
                  )}
                </button>

                {/* Error */}
                {error && (
                  <p className="text-xs text-red-400 text-center">{error}</p>
                )}

                {/* Reset */}
                {theme && !isGenerating && (
                  <button
                    onClick={() => setTheme(null)}
                    className="w-full text-[11px] text-gray-500 hover:text-gray-300 py-1 transition-colors"
                  >
                    ↩ Reset to default
                  </button>
                )}

                {/* Generated palette preview */}
                {theme && (
                  <div className="pt-3 border-t border-gray-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Palette size={12} className="text-gray-500" />
                      <span className="text-[11px] text-gray-500 uppercase tracking-wider">Generated Palette</span>
                    </div>

                    <div className="flex gap-2">
                      {[
                        { color: theme.backgroundColor, label: "BG" },
                        { color: theme.headerBg, label: "Header" },
                        { color: theme.accentColor, label: "Accent" },
                        { color: theme.borderColor, label: "Border" },
                        { color: theme.mentionColor, label: "Mention" },
                      ].map(({ color, label }) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                          <div
                            className="w-7 h-7 rounded-full border border-gray-700 shadow-inner"
                            style={{ backgroundColor: color }}
                            title={`${label}: ${color}`}
                          />
                          <span className="text-[8px] text-gray-600">{label}</span>
                        </div>
                      ))}
                    </div>

                    {theme.tagline && (
                      <p className="text-xs text-indigo-400 italic">"{theme.tagline}"</p>
                    )}

                    <div className="grid grid-cols-3 gap-1 text-[10px]">
                      <div className="bg-gray-900 rounded px-2 py-1 text-center text-gray-400">
                        {theme.fontFamily}
                      </div>
                      <div className="bg-gray-900 rounded px-2 py-1 text-center text-gray-400">
                        {theme.layout}
                      </div>
                      <div className="bg-gray-900 rounded px-2 py-1 text-center text-gray-400">
                        {theme.imageFilter}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Newsletter Preview ── */}
            <div className="flex-1 bg-white rounded-2xl overflow-auto shadow-2xl">
              <MagazineContent
                updates={week.updates}
                weekTitle={week.title}
                theme={theme ?? undefined}
              />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
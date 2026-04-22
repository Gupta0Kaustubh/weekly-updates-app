"use client"

import NewsletterCard from "./NewsletterCard"
import { useDashboard } from "./useDashboard"
import { DashboardFilters } from "./DashboardFilters"

export default function DashboardPage() {
  const {
    weeks,
    loading,
    profileNames,
    selectedNames,
    setSelectedNames,
    setSearchText,
    months,
    selectedMonths,
    setSelectedMonths,
    years,
    selectedYears,
    setSelectedYears,
  } = useDashboard()

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black text-white">
      {/* Header */}
      <div className="p-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weekly Newsletters</h1>
          <p className="text-gray-400 mt-1">Browse published company updates</p>
        </div>
        <div className="text-sm text-gray-500">{weeks.length} Published</div>
      </div>

      {/* Filters */}
      <DashboardFilters
        profileNames={profileNames}
        selectedNames={selectedNames}
        setSelectedNames={setSelectedNames}
        setSearchText={setSearchText}
        years={years}
        selectedYears={selectedYears}
        setSelectedYears={setSelectedYears}
        months={months}
        selectedMonths={selectedMonths}
        setSelectedMonths={setSelectedMonths}
      />

      {/* Content */}
      <div className="px-8 pb-10">
        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="h-[220px] rounded-xl bg-gray-800 animate-pulse" />
            ))}
          </div>
        )}

        {!loading && weeks.length === 0 && <p className="text-gray-400">No newsletters found.</p>}

        {!loading && weeks.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {weeks.map((week) => (
              <NewsletterCard key={week.id} week={week} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
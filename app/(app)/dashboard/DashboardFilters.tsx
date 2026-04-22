import MultiSelectDropdown from "@/components/ui/MultiSelectDropdown"

type DashboardFiltersProps = {
  profileNames: string[]
  selectedNames: string[]
  setSelectedNames: (val: string[]) => void
  setSearchText: (val: string) => void
  
  years: string[]
  selectedYears: string[]
  setSelectedYears: (val: string[]) => void
  
  months: string[]
  selectedMonths: string[]
  setSelectedMonths: (val: string[]) => void
}

export function DashboardFilters({
  profileNames,
  selectedNames,
  setSelectedNames,
  setSearchText,
  years,
  selectedYears,
  setSelectedYears,
  months,
  selectedMonths,
  setSelectedMonths
}: DashboardFiltersProps) {
  return (
    <div className="px-8 pb-4 flex items-center gap-4 flex-wrap">
      {/* People filter */}
      <MultiSelectDropdown
        options={profileNames}
        selected={selectedNames}
        onChange={setSelectedNames}
        placeholder="Filter by people"
        enableSearch
        onSearchChange={setSearchText}
      />

      {/* Year filter */}
      <MultiSelectDropdown
        options={years}
        selected={selectedYears}
        onChange={setSelectedYears}
        placeholder="Filter by year"
      />

      {/* Month filter */}
      <MultiSelectDropdown
        options={months}
        selected={selectedMonths}
        onChange={setSelectedMonths}
        placeholder="Filter by month"
      />

      {(selectedNames.length > 0 || selectedMonths.length > 0 || selectedYears.length > 0) && (
        <button
          onClick={() => {
            setSelectedNames([])
            setSelectedMonths([])
            setSelectedYears([])
          }}
          className="text-sm text-gray-400 hover:text-white"
        >
          Clear Filters
        </button>
      )}
    </div>
  )
}

"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import { ChevronDown } from "lucide-react"

type Props = {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  enableSearch?: boolean
  onSearchChange?: (value: string) => void // ✅ NEW
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select",
  enableSearch = false,
  onSearchChange
}: Props) {

  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const ref = useRef<HTMLDivElement>(null)

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Filter options only if search is enabled
  const filteredOptions = useMemo(() => {
    if (!enableSearch) return options

    return options.filter((opt) =>
      opt.toLowerCase().includes(search.toLowerCase())
    )
  }, [options, search, enableSearch])

  return (
    <div ref={ref} className="relative w-64">

      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full border border-gray-700 bg-gray-900 rounded-lg px-3 py-2 text-left text-sm flex items-center justify-between"
      >
        <span className="truncate">
          {selected.length === 0
            ? <span className="text-gray-400">{placeholder}</span>
            : selected.join(", ")
          }
        </span>

        <ChevronDown
          size={16}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg max-h-60 z-10">

          {/* Search (only if enabled) */}
          {enableSearch && (
            <div className="p-2 border-b border-gray-700">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => {
                  const value = e.target.value
                  setSearch(value)
                  onSearchChange?.(value) // ✅ free text search to parent
                }}
                className="w-full bg-gray-800 text-white text-sm px-2 py-1 rounded outline-none"
                autoFocus
              />
            </div>
          )}

          {/* Options */}
          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length === 0 && (
              <div className="px-3 py-2 text-gray-400 text-sm">
                No results
              </div>
            )}

            {filteredOptions.map((opt) => (
              <label
                key={opt}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-800 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => toggle(opt)}
                />
                {opt}
              </label>
            ))}
          </div>

        </div>
      )}

    </div>
  )
}
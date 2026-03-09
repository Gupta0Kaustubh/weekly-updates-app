"use client"

import { useState, useRef, useEffect } from "react"
import { ChevronDown } from "lucide-react"

type Props = {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

export default function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = "Select"
}: Props) {

  const [open, setOpen] = useState(false)
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
        <div className="absolute mt-2 w-full bg-gray-900 border border-gray-700 rounded-lg max-h-60 overflow-y-auto z-10">

          {options.map((opt) => (
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
      )}

    </div>
  )
}
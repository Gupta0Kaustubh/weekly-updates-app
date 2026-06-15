"use client"

import React, { useState, useRef, useEffect } from "react"
import { Profile } from "@/types"

interface MentionTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  profiles: Profile[]
  value: string
  onChangeValue: (val: string) => void
}

export default function MentionTextarea({
  profiles,
  value,
  onChangeValue,
  className,
  ...props
}: MentionTextareaProps) {
  const [showMentions, setShowMentions] = useState(false)
  const [mentionSearch, setMentionSearch] = useState("")
  const [triggerIndex, setTriggerIndex] = useState(-1)
  const [selectedIndex, setSelectedIndex] = useState(0)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const filteredProfiles = profiles.filter((p) =>
    p.name.toLowerCase().includes(mentionSearch.toLowerCase())
  )

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showMentions || filteredProfiles.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % filteredProfiles.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredProfiles.length) % filteredProfiles.length)
    } else if (e.key === "Enter") {
      e.preventDefault()
      selectProfile(filteredProfiles[selectedIndex])
    } else if (e.key === "Escape") {
      e.preventDefault()
      setShowMentions(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    onChangeValue(text)

    const cursorPosition = e.target.selectionStart
    const textBeforeCursor = text.slice(0, cursorPosition)
    
    // Find the last word leading up to the cursor
    // Words are separated by space or newline
    const words = textBeforeCursor.split(/[\s\n]/)
    const lastWord = words[words.length - 1]

    if (lastWord.startsWith("@")) {
      const query = lastWord.slice(1)
      setMentionSearch(query)
      setShowMentions(true)
      setTriggerIndex(cursorPosition - lastWord.length)
      setSelectedIndex(0)
    } else {
      setShowMentions(false)
    }
  }

  const selectProfile = (profile: Profile) => {
    if (!textareaRef.current) return

    const text = value
    const cursorPosition = textareaRef.current.selectionStart
    const beforeMention = text.slice(0, triggerIndex)
    const afterMention = text.slice(cursorPosition)
    
    const newValue = `${beforeMention}@${profile.name} ${afterMention}`
    onChangeValue(newValue)
    setShowMentions(false)

    // Set focus back and set cursor position after the name
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus()
        const newCursorPos = triggerIndex + profile.name.length + 2 // +2 for @ and trailing space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos)
      }
    }, 0)
  }

  // Close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (textareaRef.current && !textareaRef.current.contains(e.target as Node)) {
        const dropdown = document.getElementById("mention-dropdown")
        if (dropdown && dropdown.contains(e.target as Node)) {
          return
        }
        setShowMentions(false)
      }
    }
    document.addEventListener("mousedown", handleOutsideClick)
    return () => document.removeEventListener("mousedown", handleOutsideClick)
  }, [])

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={className}
        {...props}
      />

      {showMentions && filteredProfiles.length > 0 && (
        <div
          id="mention-dropdown"
          className="absolute left-0 mt-1 w-64 max-h-48 overflow-y-auto rounded-lg bg-gray-900 border border-gray-700 shadow-2xl z-50 py-1 text-sm text-gray-200"
          style={{
            top: "100%",
          }}
        >
          {filteredProfiles.map((p, index) => (
            <div
              key={p.id}
              onClick={() => selectProfile(p)}
              className={`px-4 py-2 cursor-pointer transition-colors ${
                index === selectedIndex
                  ? "bg-indigo-600 text-white font-medium"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              {p.name}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

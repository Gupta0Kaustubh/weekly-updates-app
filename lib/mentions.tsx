import React from "react"
import { Profile } from "@/types"

/**
 * Converts a database description containing <@uuid> to a user-friendly display description containing @Name.
 */
export function formatDescriptionToDisplay(
  dbDescription: string | null | undefined,
  profiles: Profile[]
): string {
  if (!dbDescription) return ""
  
  // Build a map of id -> name
  const profileMap = new Map<string, string>()
  profiles.forEach((p) => {
    profileMap.set(p.id, p.name)
  })

  // Replace <@uuid> with @Name
  const regex = /<@([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})>/g
  return dbDescription.replace(regex, (match, id) => {
    const name = profileMap.get(id)
    return name ? `@${name}` : match
  })
}

/**
 * Converts a user-friendly display description containing @Name back to a database description containing <@uuid>.
 */
export function formatDescriptionToDb(
  displayDescription: string | null | undefined,
  profiles: Profile[]
): string {
  if (!displayDescription) return ""

  // Sort profiles by name length descending so longer matches (e.g. @John Doe)
  // are processed before shorter matches (e.g. @John)
  const sortedProfiles = [...profiles].sort((a, b) => b.name.length - a.name.length)

  let result = displayDescription
  sortedProfiles.forEach((p) => {
    const escapedName = p.name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
    // Match @Name but not followed by alphanumeric character
    const regex = new RegExp(`@${escapedName}(?!\\w)`, "g")
    result = result.replace(regex, `<@${p.id}>`)
  })

  return result
}

/**
 * Parses a description with <@uuid> mentions and returns React Nodes with highlight elements.
 */
export function renderDescriptionWithMentions(
  description: string | null | undefined,
  profiles: Profile[],
  highlightClassName = "font-semibold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded"
): React.ReactNode {
  if (!description) return ""

  const profileMap = new Map<string, string>()
  profiles.forEach((p) => {
    profileMap.set(p.id, p.name)
  })

  const regex = /(<@[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}>)/g
  const parts = description.split(regex)

  return parts.map((part, index) => {
    const match = part.match(/<@([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})>/)
    if (match) {
      const id = match[1]
      const name = profileMap.get(id) || "Unknown User"
      return (
        <span key={index} className={highlightClassName}>
          @{name}
        </span>
      )
    }
    return part
  })
}

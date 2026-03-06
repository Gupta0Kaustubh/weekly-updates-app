import { supabase } from "@/lib/supabase"
import { Week } from "@/types"

const getCurrentMonday = () => {
  const now = new Date()
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  const monday = new Date(now.setDate(diff))
  monday.setHours(0, 0, 0, 0)
  return monday
}

const getSundayFromMonday = (monday: Date) => {
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  return sunday
}

export const getOrCreateCurrentWeek = async (): Promise<Week | null> => {
  const monday = getCurrentMonday()
  const sunday = getSundayFromMonday(monday)

  const mondayStr = monday.toISOString().split("T")[0]

  const { data: existing } = await supabase
    .from("weeks")
    .select("*")
    .eq("start_date", mondayStr)
    .single()

  if (existing) return existing

  // Close previous open weeks
  await supabase
    .from("weeks")
    .update({ status: "closed" })
    .eq("status", "open")

  const title = `Week of ${monday.toDateString()} - ${sunday.toDateString()}`

  const { data: newWeek, error } = await supabase
    .from("weeks")
    .insert([
      {
        title,
        start_date: mondayStr,
        end_date: sunday.toISOString().split("T")[0],
        status: "open",
      },
    ])
    .select()
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return newWeek
}
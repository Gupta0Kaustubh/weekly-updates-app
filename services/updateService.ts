import { supabase } from "@/lib/supabase"
import { Update } from "@/types"

export const createUpdate = async (
  update: Omit<Update, "id">
): Promise<Update | null> => {
  const { data, error } = await supabase
    .from("updates")
    .insert([update])
    .select()
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

export const getUpdatesByWeek = async (weekId: string) => {
  const { data, error } = await supabase
    .from("updates")
    .select("*")         // ONLY select columns that exist
    .eq("week_id", weekId)
    .order("order_index", { ascending: true })

  if (error) {
    console.error("Supabase error:", error.message, error.details, error.hint)
    return []
  }

  return data
}
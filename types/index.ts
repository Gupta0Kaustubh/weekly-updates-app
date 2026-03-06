export type Profile = {
  id: string
  name: string
  role: "admin" | "member"
}

export type Week = {
  id: string
  title: string
  start_date: string
  end_date: string
  status: "open" | "closed"
}

export type Update = {
  id: string
  week_id: string
  title: string
  description: string
  submitted_by: string
  submitted_by_name?: string
  impact_score?: number
  inspiration_score?: number
  image_url?: string | null
  category?: string
  status: "pending" | "approved" | "rejected"
  order_index?: number
}
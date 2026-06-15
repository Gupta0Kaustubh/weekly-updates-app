import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(req: NextRequest) {
  try {
    // 1. Verify user is authenticated by validating their JWT
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized: Missing header" }, { status: 401 })
    }

    const token = authHeader.replace("Bearer ", "")
    
    // Create an ephemeral Supabase client bound to this user's token
    const supabaseUser = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
        auth: {
          persistSession: false,
        },
      }
    )

    // Call getUser to confirm the token is valid and active
    const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized: Invalid token" }, { status: 401 })
    }

    // 2. Fetch all profiles using the service role key to bypass RLS policies
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
        },
      }
    )

    const { data: profiles, error: fetchError } = await supabaseAdmin
      .from("profiles")
      .select("id, name, role")

    if (fetchError) {
      console.error("Error fetching profiles via Admin:", fetchError)
      return NextResponse.json({ error: "Failed to fetch profiles" }, { status: 500 })
    }

    return NextResponse.json({ profiles })
  } catch (err) {
    console.error("Failed to execute profiles API:", err)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

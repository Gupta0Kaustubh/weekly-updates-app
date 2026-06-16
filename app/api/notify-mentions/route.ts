import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import type { newsLetterApproveUpdates } from "@/types/index"

// Admin client created once at module scope — avoids generic type mismatch
// when passing the client as a function argument.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────


// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Extracts unique @word tokens from a block of text.
 * Example: "Great work by @john and @priya!" → ["john", "priya"]
 */
function extractMentionTokens(text: string): string[] {
  const matches = text.matchAll(/@(\w+)/g)
  const tokens = new Set<string>()
  for (const match of matches) {
    tokens.add(match[1].toLowerCase())
  }
  return Array.from(tokens)
}

/**
 * Given a list of @mention tokens, find matching profile full names
 * from the `profiles` table. Matches on the first word of the name
 * (case-insensitive). Returns deduplicated full names.
 */
async function resolveTokensToNames(tokens: string[]): Promise<string[]> {
  if (tokens.length === 0) return []

  const { data: profiles, error } = await supabaseAdmin
    .from("profiles")
    .select("name")

  if (error || !profiles) return []

  const matchedNames = new Set<string>()

  for (const profile of profiles) {
    const firstName = (profile.name as string).split(" ")[0].toLowerCase()
    if (tokens.includes(firstName)) {
      matchedNames.add(profile.name as string)
    }
  }

  return Array.from(matchedNames)
}

/**
 * Builds a Teams MessageCard payload.
 * Compatible with all Teams Incoming Webhook connectors.
 */
function buildTeamsCard(
  mentionedNames: string[],
  weekTitle: string,
  appUrl: string
): object {
  const nameList = mentionedNames.map((n) => `• ${n}`).join("\n\n")

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "4F46E5",
    summary: "You were mentioned in the Weekly Chronicle",
    sections: [
      {
        activityTitle: "📰 Weekly Chronicle — New Edition Published!",
        activitySubtitle: weekTitle,
        activityImage:
          "https://em-content.zobj.net/source/microsoft-teams/363/newspaper_1f4f0.png",
        facts: [
          {
            name: "Mentioned team members:",
            value: mentionedNames.join(", "),
          },
        ],
        markdown: true,
      },
      {
        text: `The following people were mentioned in this week's newsletter:\n\n${nameList}`,
        markdown: true,
      },
    ],
    potentialAction: [
      {
        "@type": "OpenUri",
        name: "View Newsletter →",
        targets: [
          {
            os: "default",
            uri: `${appUrl}/dashboard`,
          },
        ],
      },
    ],
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Route Handler
// ─────────────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const webhookUrl = process.env.TEAMS_WEBHOOK_URL
    if (!webhookUrl) {
      console.warn("TEAMS_WEBHOOK_URL is not set. Skipping Teams notification.")
      return NextResponse.json(
        { skipped: true, reason: "TEAMS_WEBHOOK_URL not configured" },
        { status: 200 }
      )
    }

    const { approvedUpdates, weekTitle } = await req.json() as {
      approvedUpdates: newsLetterApproveUpdates[]
      weekTitle: string
    }

    if (!approvedUpdates || approvedUpdates.length === 0) {
      return NextResponse.json({ skipped: true, reason: "No updates provided" })
    }

    // 1. Extract all @mention tokens from all update descriptions
    const allTokens: string[] = []
    for (const update of approvedUpdates) {
      const tokens = extractMentionTokens(update.description ?? "")
      allTokens.push(...tokens)
    }
    const uniqueTokens = [...new Set(allTokens)]

    if (uniqueTokens.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: "No @mentions found in updates",
      })
    }

    // 2. Resolve tokens to real profile names via Supabase
    const mentionedNames = await resolveTokensToNames(uniqueTokens)

    if (mentionedNames.length === 0) {
      return NextResponse.json({
        skipped: true,
        reason: "No matching profiles found for extracted @mentions",
      })
    }

    // 3. Build and post the Teams card
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const card = buildTeamsCard(mentionedNames, weekTitle, appUrl)

    const teamsRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(card),
    })

    if (!teamsRes.ok) {
      const body = await teamsRes.text()
      console.error("Teams webhook failed:", teamsRes.status, body)
      return NextResponse.json(
        { error: "Teams webhook returned an error", details: body },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      notifiedCount: mentionedNames.length,
      names: mentionedNames,
    })
  } catch (err) {
    console.error("notify-mentions error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

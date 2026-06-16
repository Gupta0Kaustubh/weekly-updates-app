import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { genAI } from "@/lib/gemini"
import type { newsLetterApproveUpdates } from "@/types/index"

// ─────────────────────────────────────────────────────────────────────────────
// Clients (module-scope singletons)
// ─────────────────────────────────────────────────────────────────────────────

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type MentionAnalysis = {
  name: string
  reason: string
}

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
 * Uses Gemini AI to read the full newsletter content and generate a
 * personalised, contextual reason for each mentioned team member.
 *
 * Falls back to a generic reason if AI fails or returns unexpected output.
 */
async function analyzeMentionsWithAI(
  updates: newsLetterApproveUpdates[],
  mentionedNames: string[],
  weekTitle: string
): Promise<MentionAnalysis[]> {
  // Build a readable newsletter digest for the AI prompt
  const newsletterContent = updates
    .map(
      (u, i) =>
        `Article ${i + 1}: "${u.title}"
Submitted by: ${u.submitted_by_name ?? "Unknown"}
Content: ${u.description}`
    )
    .join("\n\n---\n\n")

  const prompt = `
You are reading the company's internal weekly newsletter. Below is the full content of this week's edition.

NEWSLETTER: "${weekTitle}"

${newsletterContent}

---

The following team members were @mentioned somewhere in the newsletter:
${mentionedNames.map((n) => `- ${n}`).join("\n")}

Your task:
For EACH mentioned person, write a single warm, professional, and specific sentence explaining WHY they were mentioned — based on the actual newsletter content. Focus on what they contributed, achieved, or were recognised for.

Return ONLY a valid JSON array. No markdown, no explanation, raw JSON only:
[
  { "name": "Full Name", "reason": "Warm, specific sentence about their contribution." }
]
`

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
    const result = await model.generateContent(prompt)
    const rawText = result.response.text().trim()

    // Strip markdown fences if the model wrapped output
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const parsed: MentionAnalysis[] = JSON.parse(cleaned)

    // Validate structure — ensure every item has name + reason strings
    if (
      Array.isArray(parsed) &&
      parsed.every(
        (item) =>
          typeof item.name === "string" && typeof item.reason === "string"
      )
    ) {
      return parsed
    }

    throw new Error("AI returned unexpected structure")
  } catch (err) {
    console.warn("AI mention analysis failed, using fallback:", err)

    // Graceful fallback — generic reason for each person
    return mentionedNames.map((name) => ({
      name,
      reason: `${name} was mentioned in this week's newsletter edition.`,
    }))
  }
}

/**
 * Builds a rich Teams MessageCard with AI-generated contextual summaries
 * for each mentioned team member.
 */
function buildTeamsCard(
  aiAnalysis: MentionAnalysis[],
  weekTitle: string,
  appUrl: string
): object {
  // Each mentioned person gets their own fact row in the Teams card
  const facts = aiAnalysis.map((item) => ({
    name: `👤 ${item.name}`,
    value: item.reason,
  }))

  return {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    themeColor: "4F46E5",
    summary: "Team members were mentioned in the Weekly Chronicle",
    sections: [
      {
        activityTitle: "📰 Weekly Chronicle — New Edition Published!",
        activitySubtitle: weekTitle,
        activityImage:
          "https://em-content.zobj.net/source/microsoft-teams/363/newspaper_1f4f0.png",
        markdown: true,
      },
      {
        title: "🔔 Mentioned Team Members",
        facts,
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

    const { approvedUpdates, weekTitle } = (await req.json()) as {
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

    // 3. Use AI to understand WHY each person was mentioned
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"

    const aiAnalysis = await analyzeMentionsWithAI(
      approvedUpdates,
      mentionedNames,
      weekTitle
    )

    // 4. Build a rich Teams card with AI-generated context per person
    const card = buildTeamsCard(aiAnalysis, weekTitle, appUrl)

    // 5. Post the card to the Teams channel
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
      aiAnalysis,
    })
  } catch (err) {
    console.error("notify-mentions error:", err)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

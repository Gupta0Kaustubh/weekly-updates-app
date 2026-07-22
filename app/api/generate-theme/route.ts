import { NextRequest, NextResponse } from "next/server"
import { genAI } from "@/lib/gemini"

const THEME_PROMPT = (occasion: string, customPrompt: string) => `
You are an expert magazine and email newsletter designer. 
Your job is to create a beautiful ThemeConfig JSON based on the occasion and prompt.
The magazine should feel unique, high-end, and custom-tailored to the content.

Occasion: ${occasion}
${customPrompt ? `Additional style instructions: ${customPrompt}` : ""}

Return ONLY a valid JSON object with exactly these keys (no markdown, no explanation, raw JSON only):

{
  "backgroundColor": "hex color — the main page background",
  "headerBg": "hex color — header section background (can differ from page bg)",
  "headerTextColor": "hex color — large title text in the header",
  "accentColor": "hex color — primary accent used for highlights and borders",
  "accentBgColor": "hex color — very light tint of the accent for backgrounds",
  "bodyTextColor": "hex color — main body text",
  "borderColor": "hex color — divider and border lines",
  "mentionColor": "hex color — @mention text color",
  "mentionBg": "hex color — @mention pill background",
  "fontFamily": "one of: serif | sans-serif | monospace",
  "imageFilter": "one of: grayscale | sepia | none | saturate",
  "dropCap": true or false,
  "layout": "one of: editorial | modern | minimal | hero-grid | magazine-spread",
  "headerEmoji": "a single relevant emoji, or empty string",
  "tagline": "a short evocative edition tagline, e.g. 'Celebrating Excellence' or 'Innovation Edition'",
  "customStyles": {
    "--article-padding": "css size, e.g. 1.5rem or 4rem",
    "--article-radius": "css size for image corners, e.g. 0px, 12px, or 50px",
    "--header-size": "css size for main title, e.g. 4rem or clamp(2rem, 8vw, 6rem)",
    "--tagline-tracking": "css letter-spacing, e.g. 0.1em or 0.8em",
    "--grid-gap": "css gap between articles, e.g. 1rem or 5rem"
  }
}

Design guidelines per occasion:
- "achievement": Rich gold/amber, serif font, bold headlines, large drop caps, wide tracking on tagline.
- "project_completion": Technical blue/teal, sans-serif, tight grids, minimal padding, clean lines.
- "promotion": Royal purple, elegant serif, generous white space (large grid-gap), sophisticated and airy.
- "anniversary": Warm rose/red, celebratory, bouncy emojis, rounded corners (large article-radius).
- "team_milestone": Energetic green, modern/minimal, tight layout, bold accent colors.
- "general": Neutral warm, professional, classic editorial feel.

Rules:
- Be CREATIVE with the customStyles to make the design unique.
- Use HARMONIOUS color pairs.
- accentBgColor should be a very light (90%+ lightness) tint of accentColor.
- All hex values must be valid 6-digit hex codes.
- Return raw JSON only, no code blocks.
`

export async function POST(req: NextRequest) {
  try {
    const { occasion, prompt } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite" })

    const result = await model.generateContent(THEME_PROMPT(occasion || "general", prompt || ""))
    const rawText = result.response.text().trim()

    // Strip markdown code fences if the model wrapped output
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const theme = JSON.parse(cleaned)

    return NextResponse.json({ theme })
  } catch (err) {
    console.error("Theme generation error:", err)
    return NextResponse.json({ error: "Failed to generate theme" }, { status: 500 })
  }
}

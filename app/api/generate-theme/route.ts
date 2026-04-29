import { NextRequest, NextResponse } from "next/server"
import { GoogleGenerativeAI } from "@google/generative-ai"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const THEME_PROMPT = (occasion: string, customPrompt: string) => `
You are an expert magazine and email newsletter designer. 
Your job is to create a beautiful ThemeConfig JSON based on the occasion and prompt.

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
  "tagline": "a short evocative edition tagline, e.g. 'Celebrating Excellence' or 'Innovation Edition'"
}

Design guidelines per occasion:
- "achievement" or "award": rich gold/amber palette (#fef9c3, #92400e), serif font, drop cap true, layout: hero-grid, festive, sepia or none image filter
- "project_completion": confident blue/teal (#e0f2fe, #0369a1), clean sans-serif, layout: magazine-spread, none image filter
- "promotion": royal purple/violet (#f3e8ff, #6d28d9), elegant serif, layout: editorial, sepia filter
- "anniversary": warm rose/pink (#fff1f2, #be123c), celebratory, serif, layout: hero-grid, saturate image filter
- "team_milestone": energetic green/emerald (#ecfdf5, #065f46), layout: magazine-spread, none filter
- "general": neutral warm (#f9fafb, #111827), clean, professional, layout: editorial

Rules:
- Use HARMONIOUS color pairs, not plain primary colors  
- backgroundColor and headerBg should complement each other
- accentBgColor should be a very light (90%+ lightness) tint of accentColor
- All hex values must be valid 6-digit hex codes starting with #
- Return raw JSON only, no code blocks, no extra text
`

export async function POST(req: NextRequest) {
  try {
    const { occasion, prompt } = await req.json()

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })

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

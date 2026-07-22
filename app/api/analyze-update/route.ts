import { NextRequest, NextResponse } from "next/server"
import { genAI } from "@/lib/gemini"

const SYSTEM_PROMPT = `
You are an AI assistant designed to evaluate weekly updates submitted by employees.
Your job is to read the user's update (title and description) and determine if it is "worth mentioning" in a weekly summary.

An update is generally worth mentioning if it:
- Highlights a clear achievement or milestone.
- Describes meaningful progress on a project.
- Shares a useful learning or insight.
- Mentions collaboration or positive team impact.

An update is NOT worth mentioning if it:
- Is extremely trivial (e.g., "checked emails", "attended a meeting" with no context).
- Is too vague (e.g., "did some stuff", "worked on things").
- Contains inappropriate content.

Return ONLY a valid JSON object with exactly these keys (no markdown, no explanation, raw JSON only):

{
  "worthMentioning": true or false,
  "reason": "A short, encouraging sentence explaining why it's not worth mentioning and how to improve it. (e.g., 'This seems a bit vague. Could you add details about what specifically you achieved?') Leave empty if worthMentioning is true."
}
`

export async function POST(req: NextRequest) {
  try {
    const { title, description } = await req.json()

    if (!title && !description) {
      return NextResponse.json({ worthMentioning: false, reason: "Title and description are empty." })
    }

    const prompt = `Title: ${title}\nDescription: ${description}`
    
    const model = genAI.getGenerativeModel({ 
      model: "gemini-3.1-flash-lite",
      systemInstruction: SYSTEM_PROMPT 
    })

    const result = await model.generateContent(prompt)
    const rawText = result.response.text().trim()

    // Strip markdown code fences if the model wrapped output
    const cleaned = rawText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim()

    const analysis = JSON.parse(cleaned)

    return NextResponse.json(analysis)
  } catch (err) {
    console.error("Analyze update error:", err)
    // Fallback: allow submission if AI fails
    return NextResponse.json({ worthMentioning: true, reason: "" })
  }
}

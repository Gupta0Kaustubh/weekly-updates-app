import { GoogleGenerativeAI } from "@google/generative-ai"

/**
 * Shared Gemini AI client — created once at module scope.
 * Import this instead of instantiating GoogleGenerativeAI in individual files.
 *
 * Usage:
 *   import { genAI } from "@/lib/gemini"
 *   const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" })
 */
export const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

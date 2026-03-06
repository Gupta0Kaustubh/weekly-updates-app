import { NextRequest, NextResponse } from "next/server"
import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"
import { v4 as uuidv4 } from "uuid"

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { imageBase64, recipient } = await req.json()

    if (!imageBase64 || !recipient) {
      return NextResponse.json({ error: "Missing image or recipient" }, { status: 400 })
    }

    // Convert base64 to Buffer
    const imageBuffer = Buffer.from(imageBase64, "base64")
    const fileName = `newsletter-exports/${uuidv4()}.png`

    // Upload to Supabase using service role key
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from("updates")
      .upload(fileName, imageBuffer, { contentType: "image/png" })

    if (uploadError) {
      console.error("Supabase upload failed:", uploadError)
      return NextResponse.json({ error: "Failed to upload newsletter" }, { status: 500 })
    }

    // Get public URL
    const { data } = supabaseAdmin.storage.from("updates").getPublicUrl(fileName)
    const imageUrl = data.publicUrl

    // Send email via Nodemailer
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    })

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: recipient,
      subject: "Weekly Newsletter",
      text: "Hi,\n\nPlease find this week's newsletter attached.",
      attachments: [
        { filename: "weekly_newsletter.png", content: imageBuffer, contentType: "image/png" },
      ],
    })

    return NextResponse.json({ success: true, imageUrl })

  } catch (err) {
    console.error("Failed to send newsletter:", err)
    return NextResponse.json({ error: "Failed to send newsletter" }, { status: 500 })
  }
}
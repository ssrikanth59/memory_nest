import { NextResponse } from "next/server";
import { connectToDB } from "@/lib/mongodb";
import ContactMessage from "@/lib/models/ContactMessage";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: Request) {
  try {
    await connectToDB();
    const body = await req.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Save to MongoDB
    const newMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
      status: "pending",
    });

    // Send email notification
    await transporter.sendMail({
      from: `"MemoryNest Contact" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `[MemoryNest] ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9fafb; padding: 24px; border-radius: 12px;">
          <h2 style="color: #0d9488; margin-bottom: 4px;">New Contact Message</h2>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 24px;">From the MemoryNest contact form</p>

          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151; width: 80px;">Name</td>
              <td style="padding: 8px 0; color: #111827;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Email</td>
              <td style="padding: 8px 0; color: #111827;"><a href="mailto:${email}" style="color: #0d9488;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold; color: #374151;">Subject</td>
              <td style="padding: 8px 0; color: #111827;">${subject}</td>
            </tr>
          </table>

          <div style="margin-top: 20px; padding: 16px; background: #ffffff; border-left: 4px solid #0d9488; border-radius: 4px;">
            <p style="font-weight: bold; color: #374151; margin: 0 0 8px;">Message</p>
            <p style="color: #111827; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>

          <p style="margin-top: 20px; font-size: 12px; color: #9ca3af;">Reply directly to this email to respond to ${name}.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: newMessage }, { status: 201 });
  } catch (error) {
    console.error("API Contact Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await connectToDB();
    const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
    return NextResponse.json(messages);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

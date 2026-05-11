import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, inviteLink } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const userName = session.user?.name || "A Memory Nest User";

    const mailOptions = {
      from: `"Memory Nest" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `${userName} invited you to their Memory Nest!`,
      html: `
        <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; text-align: center; color: #333; padding: 40px 20px; background-color: #f9fafb; border-radius: 20px; max-w: 600px; margin: 0 auto;">
          <div style="background-color: white; padding: 40px; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05);">
            <h2 style="color: #ff2d55; font-size: 28px; font-weight: 900; margin-bottom: 10px; letter-spacing: -0.5px;">You're Invited! 🎉</h2>
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-bottom: 30px;">
              <strong>${userName}</strong> wants you to join their secure family vault on <strong>Memory Nest</strong>. You'll be able to view and safely share their most precious family memories.
            </p>
            <div style="margin: 40px 0;">
              <a href="${inviteLink}" style="background-color: #ff2d55; color: white; padding: 16px 32px; text-decoration: none; border-radius: 12px; font-weight: 800; font-size: 16px; box-shadow: 0 10px 20px rgba(255, 45, 85, 0.3); display: inline-block;">
                Accept Invitation
              </a>
            </div>
            <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
              If the button doesn't work, copy and paste this link into your browser: <br/> 
              <span style="color: #6b7280; word-break: break-all; margin-top: 5px; display: inline-block;">${inviteLink}</span>
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({ message: "Invitation sent successfully!" }, { status: 200 });
  } catch (error: any) {
    console.error("Invite Error:", error);
    return NextResponse.json({ error: "Failed to send invitation." }, { status: 500 });
  }
}

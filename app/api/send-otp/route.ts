// /app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import nodemailer from "nodemailer";

const sql = neon(process.env.NEON_DATABASE_URL as string);
const OTP_EXPIRY = 10; // minutes

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ success: false, error: "Email is required" }, { status: 400 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Expiry timestamp
    const expiresAt = new Date(Date.now() + OTP_EXPIRY * 60 * 1000);

    // Store OTP in Neon
    await sql`
      INSERT INTO otp_table (email, otp, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
      ON CONFLICT (email) DO UPDATE
      SET otp = ${otp}, expires_at = ${expiresAt};
    `;

    // Nodemailer transporter for Gmail
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // SSL
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Nirdeshona" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in ${OTP_EXPIRY} minutes.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

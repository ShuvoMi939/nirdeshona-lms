// /app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import nodemailer from "nodemailer";

const sql = neon(process.env.NEON_DATABASE_URL as string);
const OTP_EXPIRY = 10; // OTP expiry in minutes

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // ✅ Store OTP in Neon DB with proper interval
    await sql`
      INSERT INTO otp_table (email, otp, expires_at)
      VALUES (${email}, ${otp}, NOW() + ${OTP_EXPIRY} * INTERVAL '1 minute')
      ON CONFLICT (email) DO UPDATE
      SET otp = ${otp}, expires_at = NOW() + ${OTP_EXPIRY} * INTERVAL '1 minute';
    `;

    // ✅ Send OTP via email using Nodemailer
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Nirdeshona" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. It expires in ${OTP_EXPIRY} minutes.`,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json(
      { success: false, error: "Server error" },
      { status: 500 }
    );
  }
}

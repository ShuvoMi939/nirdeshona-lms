// /app/api/send-otp/route.ts
import { NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL as string);

const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(req: Request) {
  try {
    const { email, resend } = await req.json();
    if (!email) return NextResponse.json({ error: "Email is required" }, { status: 400 });

    // Check if user exists
    const user = await sql`SELECT * FROM users WHERE email = ${email} LIMIT 1`;
    if (user.length === 0)
      return NextResponse.json({ error: "No account found with this email." }, { status: 404 });

    // Cleanup expired OTPs
    const now = new Date();
    await sql`DELETE FROM otp_table WHERE expires_at < ${now}`;

    // Check if OTP already exists for this user
    const existingOtp = await sql`SELECT * FROM otp_table WHERE email = ${email} LIMIT 1`;

    if (existingOtp.length > 0 && !resend) {
      // OTP exists and user did not click Resend
      return NextResponse.json({
        success: true,
        otpAlreadySent: true,
        message: "We already have sent you an OTP. Check your email. If you do not get any email or face difficulties, click Resend."
      });
    }

    // Generate new OTP
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    // Upsert OTP
    await sql`
      INSERT INTO otp_table (email, otp, expires_at)
      VALUES (${email}, ${otp}, ${expiresAt})
      ON CONFLICT (email) DO UPDATE SET otp = ${otp}, expires_at = ${expiresAt};
    `;

    // Send email
    await transporter.sendMail({
      from: `"Nirdeshona" <${process.env.SMTP_USER}>`,
      to: email,
      subject: "Your Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; text-align:center;">
          <h2>Password Reset OTP</h2>
          <p>Your OTP is:</p>
          <h1 style="letter-spacing: 4px; font-size: 32px;">${otp}</h1>
          <p>This OTP will expire in 10 minutes.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, otpAlreadySent: false });
  } catch (err) {
    console.error("SEND OTP ERROR:", err);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}

// /app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import admin from "@/lib/firebaseAdmin";

const sql = neon(process.env.NEON_DATABASE_URL as string);

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();

    if (!email || !otp || !newPassword) {
      return NextResponse.json({ error: "Email, OTP and new password are required" }, { status: 400 });
    }

    // Fetch OTP from Neon DB
    const result = await sql`
      SELECT otp, expires_at
      FROM otp_table
      WHERE email = ${email};
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "No OTP found. Please request a new one." }, { status: 400 });
    }

    const { otp: storedOtp, expires_at } = result[0];

    if (storedOtp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }

    if (new Date(expires_at) < new Date()) {
      return NextResponse.json({ error: "OTP expired. Please request a new one." }, { status: 400 });
    }

    // Update Firebase password
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().updateUser(user.uid, { password: newPassword });

    // Delete OTP after success
    await sql`DELETE FROM otp_table WHERE email = ${email};`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ error: "Failed to verify OTP" }, { status: 500 });
  }
}

// /app/api/verify-otp/route.ts
import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { auth } from "@/lib/firebase-admin";

const sql = neon(process.env.NEON_DATABASE_URL as string);

export async function POST(req: Request) {
  try {
    const { email, otp, newPassword } = await req.json();
    if (!email || !otp || !newPassword)
      return NextResponse.json({ success: false, error: "All fields are required" }, { status: 400 });

    const result = await sql`
      SELECT * FROM otp_table
      WHERE email = ${email} AND otp = ${otp} AND expires_at > NOW()
      LIMIT 1;
    `;

    if (result.length === 0)
      return NextResponse.json({ success: false, error: "Invalid or expired OTP" }, { status: 400 });

    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });

    await sql`DELETE FROM otp_table WHERE email = ${email}`;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("VERIFY OTP ERROR:", err);
    return NextResponse.json({ success: false, error: "Server error" }, { status: 500 });
  }
}

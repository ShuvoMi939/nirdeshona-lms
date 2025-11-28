import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    const result = await pool.query("SELECT role FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return NextResponse.json({ role: "subscriber" });
    return NextResponse.json({ role: result.rows[0].role });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ role: "subscriber" }, { status: 500 });
  }
}

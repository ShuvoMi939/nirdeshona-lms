import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function POST(req: NextRequest) {
  try {
    const { email, role } = await req.json();
    if (!email || !role) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);

    // Only admin can update
    const roleRes = await pool.query("SELECT role FROM users WHERE email = $1", [decoded.email]);
    if (roleRes.rows[0]?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await pool.query("UPDATE users SET role=$1 WHERE email=$2", [role, email]);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update role" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email;

    // Check admin role
    const roleRes = await pool.query("SELECT role FROM users WHERE email = $1", [email]);
    if (roleRes.rows[0]?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const usersRes = await pool.query("SELECT id, name, email, role FROM users ORDER BY created_at DESC");
    return NextResponse.json({ users: usersRes.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

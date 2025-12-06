import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    const roles = await pool.query("SELECT * FROM roles ORDER BY id ASC");
    return NextResponse.json({ roles: roles.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch roles" }, { status: 500 });
  }
}

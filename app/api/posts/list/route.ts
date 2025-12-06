// app/api/posts/list/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    // select categories and tags as-is (they are arrays)
    const result = await pool.query(`SELECT * FROM posts ORDER BY created_at DESC`);
    return NextResponse.json({ posts: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

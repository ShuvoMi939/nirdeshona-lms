// app/api/categories/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    return NextResponse.json({ categories: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to load categories" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { name } = await req.json();

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    await pool.query("INSERT INTO categories (name) VALUES ($1)", [name]);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Creation failed" }, { status: 500 });
  }
}

// app/api/categories/list/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM categories ORDER BY id DESC");
    return NextResponse.json({ categories: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch categories" }, { status: 500 });
  }
}

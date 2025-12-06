// app/api/categories/create/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function POST(req: Request) {
  try {
    const { name, parent_id } = await req.json();
    if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    const result = await pool.query(
      "INSERT INTO categories (name, parent_id) VALUES ($1, $2) RETURNING *",
      [name, parent_id || null]
    );

    return NextResponse.json({ category: result.rows[0] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// app/api/categories/update/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function PATCH(req: Request) {
  try {
    const { id, name, parent_id } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "Missing data" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    const result = await pool.query(
      "UPDATE categories SET name=$1, parent_id=$2 WHERE id=$3 RETURNING *",
      [name, parent_id || null, id]
    );

    return NextResponse.json({ category: result.rows[0] });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

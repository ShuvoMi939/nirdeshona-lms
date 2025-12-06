// app/api/categories/delete/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing category id" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    await pool.query("DELETE FROM categories WHERE id=$1", [id]);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

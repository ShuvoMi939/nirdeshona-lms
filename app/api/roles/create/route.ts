import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function POST(req: Request) {
  try {
    const { name, label } = await req.json();

    if (!name || !label)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];

    if (!token)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await adminAuth.verifyIdToken(token);

    await pool.query(
      "INSERT INTO roles (name, label) VALUES ($1, $2)",
      [name, label]
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 }
    );
  }
}

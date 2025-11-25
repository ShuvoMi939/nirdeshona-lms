import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL as string);

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ exists: false }, { status: 400 });
    }

    // Query Neon DB
    const result = await sql`
      SELECT id, name, email, avatar_url 
      FROM users 
      WHERE email = ${email}
      LIMIT 1;
    `;

    if (result.length === 0) {
      return NextResponse.json({ exists: false }, { status: 200 });
    }

    return NextResponse.json(
      { exists: true, user: result[0] },
      { status: 200 }
    );
  } catch (error) {
    console.error("LOGIN-CHECK ERROR:", error);
    return NextResponse.json(
      { exists: false, error: "Server error" },
      { status: 500 }
    );
  }
}

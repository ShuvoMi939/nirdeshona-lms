// app/api/posts/public-list/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET() {
  try {
    // Only fetch published posts
    const result = await pool.query(`
      SELECT id, title, content, slug, thumbnail, created_at, categories
      FROM posts
      WHERE status = 'published'
      ORDER BY created_at DESC
    `);

    return NextResponse.json({ posts: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

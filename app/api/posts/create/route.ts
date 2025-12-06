import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      title,
      content,
      author_id,
      role,
      status,
      thumbnail,
      tags,
      categories,
      slug,
    } = body;

    if (!title || !content || !author_id || !role)
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await adminAuth.verifyIdToken(token);

    // Prepare values - ensure tags is text[] and categories is integer[]
    const tagsArr = Array.isArray(tags) ? tags : (tags ? tags : []);
    const categoriesArr = Array.isArray(categories) ? categories : (categories ? categories : []);

    const result = await pool.query(
      `INSERT INTO posts
        (title, content, author_id, role, status, thumbnail, tags, categories, slug)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
       RETURNING *`,
      [
        title,
        content,
        author_id,
        role,
        status || "draft",
        thumbnail || null,
        tagsArr.length ? tagsArr : null,      // send null or array
        categoriesArr.length ? categoriesArr : null,
        slug || title.toLowerCase().replace(/\s+/g, "-")
      ]
    );

    return NextResponse.json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

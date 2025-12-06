import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, content, status, thumbnail, tags, categories, slug } = body;

    if (!id) return NextResponse.json({ error: "Missing post ID" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await adminAuth.verifyIdToken(token);

    const tagsArr = Array.isArray(tags) ? tags : (tags ? tags : []);
    const categoriesArr = Array.isArray(categories) ? categories : (categories ? categories : []);

    const result = await pool.query(
      `UPDATE posts SET
         title = $1,
         content = $2,
         status = $3,
         thumbnail = $4,
         tags = $5,
         categories = $6,
         slug = $7
       WHERE id = $8
       RETURNING *`,
      [
        title,
        content,
        status || "draft",
        thumbnail || null,
        tagsArr.length ? tagsArr : null,
        categoriesArr.length ? categoriesArr : null,
        slug || (title ? title.toLowerCase().replace(/\s+/g, "-") : null),
        id
      ]
    );

    return NextResponse.json({ post: result.rows[0] });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

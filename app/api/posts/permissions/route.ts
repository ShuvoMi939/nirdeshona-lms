// app/api/posts/permissions/route.ts
import { NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function GET() {
  try {
    const result = await pool.query("SELECT * FROM post_permissions ORDER BY role ASC");
    return NextResponse.json({ permissions: result.rows });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to fetch permissions" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const permissionsArray = Array.isArray(data) ? data : data.permissions;

    if (!permissionsArray || !permissionsArray.length)
      return NextResponse.json({ error: "No permissions provided" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    await adminAuth.verifyIdToken(token);

    const queries = permissionsArray.map((perm: any) =>
      pool.query(
        `INSERT INTO post_permissions
          (role, can_create, can_edit_own, can_edit_any, can_delete, can_publish,
           can_create_category, can_edit_category, can_delete_category)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
         ON CONFLICT (role) DO UPDATE SET
           can_create=$2, can_edit_own=$3, can_edit_any=$4, can_delete=$5, can_publish=$6,
           can_create_category=$7, can_edit_category=$8, can_delete_category=$9`,
        [
          perm.role,
          perm.can_create,
          perm.can_edit_own,
          perm.can_edit_any,
          perm.can_delete,
          perm.can_publish,
          perm.can_create_category,
          perm.can_edit_category,
          perm.can_delete_category,
        ]
      )
    );

    await Promise.all(queries);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to update permissions" }, { status: 500 });
  }
}

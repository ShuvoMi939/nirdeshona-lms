import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { adminAuth } from "@/lib/firebaseAdmin";

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL });

export async function DELETE(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "Missing email" }, { status: 400 });

    const token = req.headers.get("authorization")?.split("Bearer ")[1];
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth.verifyIdToken(token);

    // Check if requester is admin
    const roleRes = await pool.query("SELECT role FROM users WHERE email = $1", [decoded.email]);
    if (roleRes.rows[0]?.role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Prevent deleting admin users
    const targetUser = await pool.query("SELECT role FROM users WHERE email = $1", [email]);
    if (targetUser.rows[0]?.role === "admin")
      return NextResponse.json({ error: "Cannot delete admin user" }, { status: 403 });

    // Delete from Neon database
    await pool.query("DELETE FROM users WHERE email=$1", [email]);

    // Delete from Firebase Authentication
    try {
      const firebaseUser = await adminAuth.getUserByEmail(email);
      if (firebaseUser) {
        await adminAuth.deleteUser(firebaseUser.uid);
      }
    } catch (firebaseErr) {
      console.error("Failed to delete user from Firebase Auth:", firebaseErr);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}

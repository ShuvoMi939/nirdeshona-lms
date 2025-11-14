import { NextRequest, NextResponse } from "next/server";
import admin from "@/lib/firebaseAdmin"; // Import Firebase Admin SDK

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { uid } = body;

    if (!uid) return NextResponse.json({ error: "UID is required" }, { status: 400 });

    // Delete from Firebase Auth
    await admin.auth().deleteUser(uid);

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete user" }, { status: 500 });
  }
}

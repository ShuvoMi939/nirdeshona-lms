import { neonDB } from "@/lib/neon";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Incoming body:", body);

    const { uid, name, email, avatar_url } = body;

    console.log("Inserting into Neon...");

    await neonDB`
      INSERT INTO users (id, name, email, avatar_url)
      VALUES (${uid}, ${name}, ${email}, ${avatar_url})
      ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email,
        avatar_url = EXCLUDED.avatar_url
    `;

    console.log("Neon insert success");
    return Response.json({ success: true });

  } catch (err: any) {
    console.error("🔥 Neon ERROR:", err);
    return new Response("Database error", { status: 500 });
  }
}

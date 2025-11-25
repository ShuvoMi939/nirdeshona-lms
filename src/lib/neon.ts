import { neon } from "@neondatabase/serverless";

export const neonDB = neon(process.env.NEON_DATABASE_URL!);

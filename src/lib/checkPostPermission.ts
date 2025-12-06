// src/lib/checkPostPermission.ts
import { neonDB } from "./neon";

export async function getPostPermissions(role: string) {
  const result = await neonDB.query(
    `SELECT * FROM post_permissions WHERE role = $1 LIMIT 1`,
    [role]
  );

  if (!result || result.length === 0) {
    return {
      can_create: false,
      can_edit_own: false,
      can_edit_any: false,
      can_delete: false,
      can_publish: false,
    };
  }

  return result[0];
}

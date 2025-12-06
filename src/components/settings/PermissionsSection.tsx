"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Loading from "@/components/Loading";

export type Permission = {
  role: string;
  can_create: boolean;
  can_edit_own: boolean;
  can_edit_any: boolean;
  can_delete: boolean;
  can_publish: boolean;
  can_create_category: boolean;
  can_edit_category: boolean;
  can_delete_category: boolean;
};

export default function PermissionsSection() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingPerms, setSavingPerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();

      const [permRes, rolesRes] = await Promise.all([
        fetch("/api/posts/permissions", { headers: { Authorization: `Bearer ${token}` } }),
        fetch("/api/roles/list", { headers: { Authorization: `Bearer ${token}` } }),
      ]);

      const permData = await permRes.json();
      const rolesData = await rolesRes.json();

      setRoles(rolesData.roles);

      const merged = rolesData.roles.map((r: any) =>
        permData.permissions.find((p: Permission) => p.role === r.name) || {
          role: r.name,
          can_create: false,
          can_edit_own: false,
          can_edit_any: false,
          can_delete: false,
          can_publish: false,
          can_create_category: false,
          can_edit_category: false,
          can_delete_category: false,
        }
      );

      setPermissions(merged);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const togglePermission = (role: string, field: keyof Permission) => {
    setPermissions((prev) =>
      prev.map((p) =>
        p.role === role ? { ...p, [field]: !p[field] } : p
      )
    );
  };

  const saveAllPermissions = async () => {
    try {
      setSavingPerms(true);
      setError(null);
      setSuccess(null);

      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/posts/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ permissions }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setSuccess("Permissions updated successfully!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSavingPerms(false);
    }
  };

  if (loading) return <Loading />;

  const postFields: (keyof Permission)[] = ["can_create", "can_edit_own", "can_edit_any", "can_delete", "can_publish"];
  const categoryFields: (keyof Permission)[] = ["can_create_category", "can_edit_category", "can_delete_category"];

  return (
    <div className="flex flex-col max-h-[500px]">
      {/* Heading */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold">Manage Permissions</h2>
        <button
          disabled={savingPerms}
          onClick={saveAllPermissions}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {savingPerms ? "Saving..." : "Save All"}
        </button>
      </div>

      {/* Error / Success Messages */}
      {error && <p className="text-red-600 mb-2">{error}</p>}
      {success && <p className="text-green-600 mb-2">{success}</p>}

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full table-auto border-collapse min-w-max">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 px-4 py-2 text-left">Role</th>
              {postFields.map(f => (
                <th key={f} className="border border-gray-300 px-4 py-2">
                  {f.replace(/can_/,"").replace(/_/g," ")}
                </th>
              ))}
              {categoryFields.map(f => (
                <th key={f} className="border border-gray-300 px-4 py-2">
                  {f.replace(/can_/,"").replace(/_/g," ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((perm) => (
              <tr key={perm.role} className="hover:bg-gray-50">
                <td className="border border-gray-300 px-4 py-2">{perm.role}</td>
                {[...postFields, ...categoryFields].map(f => (
                  <td key={f} className="border border-gray-300 px-4 py-2 text-center">
                    <input
                      type="checkbox"
                      checked={!!perm[f]}
                      onChange={() => togglePermission(perm.role, f)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

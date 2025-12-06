"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import NothingFound from "@/components/NothingFound";
import Loading from "@/components/Loading";

type Role = {
  id: number;
  name: string;
  label: string;
};

export default function RolesManagementPage() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [label, setLabel] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/roles/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);
      setRoles(data.roles);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createRole = async () => {
    if (!name || !label) return alert("All fields required");

    if (name === "admin") return alert("You cannot create admin role");

    try {
      setCreating(true);
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/roles/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, label }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setName("");
      setLabel("");
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const deleteRole = async (id: number, name: string) => {
    if (name === "admin") return alert("Admin role cannot be deleted");
    if (!confirm(`Delete the role '${name}'?`)) return;

    try {
      const token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/roles/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="p-6 bg-white border border-gray-200">

      <h1 className="text-3xl font-bold mb-4 text-gray-800">
        Role Management
      </h1>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      {/* Create Role */}
      <div className="border border-gray-300 p-4 mb-6">
        <h2 className="text-xl font-semibold mb-3">Create New Role</h2>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            placeholder="role key (e.g., writer)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="px-3 py-2 border border-gray-300"
          />
          <input
            type="text"
            placeholder="Display Label (e.g., Writer)"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="px-3 py-2 border border-gray-300"
          />
          <button
            onClick={createRole}
            disabled={creating}
            className="px-4 py-2 bg-blue-600 text-white"
          >
            Add Role
          </button>
        </div>
      </div>

      {/* Role List */}
      <div className="border border-gray-300 p-4">
        <h2 className="text-xl font-semibold mb-3">All Roles</h2>

        {roles.length === 0 && (
          <NothingFound
            message="No roles created yet."
            linkHref="/control-panel/roles"
            linkText="Refresh"
          />
        )}

        <div className="space-y-2">
          {roles.map((role) => (
            <div
              key={role.id}
              className="flex justify-between items-center border border-gray-300 p-3"
            >
              <div>
                <p className="font-semibold">{role.label}</p>
                <p className="text-gray-500 text-sm">{role.name}</p>
              </div>

              {role.name !== "admin" && (
                <button
                  onClick={() => deleteRole(role.id, role.name)}
                  className="px-3 py-1 bg-red-600 text-white"
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

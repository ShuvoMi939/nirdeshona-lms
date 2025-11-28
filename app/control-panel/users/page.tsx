"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import UserCard from "@/components/UserCard";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [roleCheck, setRoleCheck] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const router = useRouter();

  useEffect(() => {
    const cachedUsers = sessionStorage.getItem("admin_users");
    const cachedRole = sessionStorage.getItem("admin_role");

    if (cachedUsers && cachedRole) {
      const usersData = JSON.parse(cachedUsers);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setRoleCheck(cachedRole);
      setLoading(false);
      return;
    }

    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/auth/login");
        return;
      }

      try {
        const token = await user.getIdToken();
        const resRole = await fetch("/api/users/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        });
        const roleData = await resRole.json();

        if (!resRole.ok || roleData.role !== "admin") {
          setRoleCheck("denied");
          setLoading(false);
          return;
        }

        setRoleCheck("admin");
        fetchUsers(token);
      } catch (err) {
        console.error(err);
        setRoleCheck("denied");
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  const fetchUsers = async (token?: string) => {
    try {
      setLoading(true);
      if (!token) token = await auth.currentUser?.getIdToken();

      const res = await fetch("/api/users/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to fetch users");

      setUsers(data.users);
      setFilteredUsers(data.users);

      sessionStorage.setItem("admin_users", JSON.stringify(data.users));
      sessionStorage.setItem("admin_role", "admin");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = () => {
    sessionStorage.removeItem("admin_users");
    sessionStorage.removeItem("admin_role");
    fetchUsers();
  };

  const handleRoleChange = async (email: string, role: string) => {
    const user = users.find((u) => u.email === email);
    if (!user || user.role === "admin") return;

    if (!confirm(`Change ${email}'s role to ${role}?`)) return;

    try {
      setUpdating(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/users/update-role", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update role");

      const updatedUsers = users.map((u) =>
        u.email === email ? { ...u, role } : u
      );
      setUsers(updatedUsers);
      setFilteredUsers(applyFilters(updatedUsers, searchTerm, roleFilter));
      sessionStorage.setItem("admin_users", JSON.stringify(updatedUsers));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (email: string) => {
    const user = users.find((u) => u.email === email);
    if (!user || user.role === "admin") return;

    if (!confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      setUpdating(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete user");

      const updatedUsers = users.filter((u) => u.email !== email);
      setUsers(updatedUsers);
      setFilteredUsers(applyFilters(updatedUsers, searchTerm, roleFilter));
      sessionStorage.setItem("admin_users", JSON.stringify(updatedUsers));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const applyFilters = (usersList: User[], term: string, role: string) => {
    return usersList.filter((u) => {
      const matchesRole = role === "all" || u.role === role;
      const matchesSearch =
        u.name.toLowerCase().includes(term.toLowerCase()) ||
        u.email.toLowerCase().includes(term.toLowerCase()) ||
        u.id.toLowerCase().includes(term.toLowerCase());
      return matchesRole && matchesSearch;
    });
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setFilteredUsers(applyFilters(users, term, roleFilter));
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setFilteredUsers(applyFilters(users, searchTerm, role));
  };

  if (loading) return <p className="p-6 text-gray-500">Loading...</p>;
  if (roleCheck === "denied")
    return <p className="p-6 text-red-600">Access Denied. Only admins can view this page.</p>;

  return (
    <div className="p-5 bg-white min-h-fit border border-gray-200">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Search here..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="px-3 py-0 border border-gray-300 height-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={roleFilter}
            onChange={(e) => handleRoleFilter(e.target.value)}
            className="px-3 py-0 border border-gray-300 height-[40px] focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="subscriber">Subscriber</option>
            <option value="teacher">Teacher</option>
            <option value="moderator">Moderator</option>
            <option value="student">Student</option>
          </select>
          <button
            onClick={clearCache}
            className="px-3 py-0 border border-blue-700 height-[40px] bg-blue-600 text-white hover:bg-blue-700 hover:border-blue-800 transition"
          >
            Refresh Users
          </button>
        </div>
      </div>

      {error && <p className="mb-4 text-red-600 font-medium">{error}</p>}

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <UserCard
            key={user.id}
            user={user}
            updating={updating}
            onRoleChange={handleRoleChange}
            onDelete={handleDelete}
          />
        ))}
        {filteredUsers.length === 0 && (
          <p className="text-gray-500 text-center mt-4">No users found.</p>
        )}
      </div>
    </div>
  );
}

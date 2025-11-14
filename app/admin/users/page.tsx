"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

type User = {
  uid: string;
  name: string;
  email: string;
  role: string;
  publicUid?: string;
  createdAt: any;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmPopup, setConfirmPopup] = useState<{ open: boolean; uid: string; name: string; role: string }>({
    open: false,
    uid: "",
    name: "",
    role: "",
  });

  // 🔹 Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const userList: User[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          uid: d.id,
          name: data.name || "N/A",
          email: data.email || "N/A",
          role: data.role || "user",
          publicUid: data.publicUid || null,
          createdAt: data.createdAt || null,
        };
      });
      setUsers(userList);
    } catch (err) {
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 🔹 Handle delete user
  const handleDeleteUser = async (uid: string, role: string) => {
    if (role === "admin") {
      alert("Admin user cannot be deleted.");
      return;
    }

    try {
      // 1️⃣ Delete from Firestore
      await deleteDoc(doc(db, "users", uid));

      // 2️⃣ Delete from Firebase Auth via API route
      const res = await fetch("/api/delete-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete from Auth");

      // 3️⃣ Update local state
      setUsers((prev) => prev.filter((u) => u.uid !== uid));
      setConfirmPopup({ open: false, uid: "", name: "", role: "" });
    } catch (err: any) {
      console.error(err);
      alert("Failed to delete user: " + err.message);
      setConfirmPopup({ open: false, uid: "", name: "", role: "" });
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen p-6 bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Manage Users</h1>
          <Link
            href="/admin/dashboard"
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
          >
            Back to Dashboard
          </Link>
        </div>

        <div className="overflow-x-auto bg-white rounded-lg shadow p-4">
          {loading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-gray-500">No users found.</p>
          ) : (
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border px-3 py-2 text-left">Name</th>
                  <th className="border px-3 py-2 text-left">Email</th>
                  <th className="border px-3 py-2 text-left">Role</th>
                  <th className="border px-3 py-2 text-left">Created At</th>
                  <th className="border px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const profilePath = user.publicUid
                    ? `/users/${user.publicUid}`
                    : `/users/${user.uid}`;
                  return (
                    <tr key={user.uid} className="hover:bg-gray-50">
                      <td className="border px-3 py-2">{user.name}</td>
                      <td className="border px-3 py-2">{user.email}</td>
                      <td className="border px-3 py-2 capitalize">{user.role}</td>
                      <td className="border px-3 py-2">
                        {user.createdAt?.toDate?.()?.toLocaleString?.() || "-"}
                      </td>
                      <td className="border px-3 py-2 flex gap-2">
                        {user.role !== "admin" ? (
                          <>
                            <Link
                              href={`/admin/users/edit/${user.uid}`}
                              className="text-blue-600 underline"
                            >
                              Edit
                            </Link>
                            <Link
                              href={profilePath}
                              className="text-green-600 underline"
                              target="_blank"
                            >
                              Public Profile
                            </Link>
                            <button
                              className="text-red-600 underline"
                              onClick={() =>
                                setConfirmPopup({
                                  open: true,
                                  uid: user.uid,
                                  name: user.name,
                                  role: user.role,
                                })
                              }
                            >
                              Delete
                            </button>
                          </>
                        ) : (
                          <span className="text-gray-500 italic">Protected</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Confirm Popup */}
        {confirmPopup.open && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
              <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
              <p className="mb-6">
                Are you sure you want to delete <strong>{confirmPopup.name}</strong>?
              </p>
              <div className="flex justify-between gap-4">
                <button
                  className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
                  onClick={() => setConfirmPopup({ open: false, uid: "", name: "", role: "" })}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                  onClick={() => handleDeleteUser(confirmPopup.uid, confirmPopup.role)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}

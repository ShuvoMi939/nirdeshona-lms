"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Link from "next/link";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid; // Ensure string

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "subscriber" | "moderator" | "instructor" | "premium-user" | "admin"
  >("subscriber");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!uid) return; // Safety check
    const fetchUser = async () => {
      setLoading(true);
      try {
        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          setError("User not found.");
          setLoading(false);
          return;
        }

        const data = userSnap.data();
        setName(data.name || "");
        setEmail(data.email || "");
        setRole(data.role || "subscriber");

        if (data.role === "admin") setIsAdmin(true);
      } catch {
        setError("Failed to fetch user.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [uid]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdmin || !uid) return;

    setSaving(true);
    setError("");

    try {
      const userRef = doc(db, "users", uid);
      await updateDoc(userRef, {
        name,
        email,
        role,
      });
      router.push("/admin/dashboard?tab=users");
    } catch {
      setError("Failed to update user.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-gray-50 p-4 md:p-6">
        <div className="max-w-md w-full mx-auto bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-semibold mb-4">Edit User</h1>

          {loading ? (
            <p className="text-gray-500">Loading user data...</p>
          ) : isAdmin ? (
            <p className="text-red-600">
              Admin users cannot be edited.{" "}
              <Link href="/admin/dashboard?tab=users" className="underline text-blue-600">
                Go back
              </Link>
            </p>
          ) : (
            <form onSubmit={handleSave} className="grid gap-4">
              {error && <p className="text-red-600 text-sm">{error}</p>}

              <FloatingLabelInput
                label="Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <FloatingLabelInput
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <div className="flex flex-col gap-1">
                <label className="text-gray-700 text-sm font-medium">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-700"
                >
                  <option value="subscriber">Subscriber</option>
                  <option value="moderator">Moderator</option>
                  <option value="instructor">Instructor</option>
                  <option value="premium-user">Premium User</option>
                </select>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900 transition w-full"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>

                <Link
                  href="/admin/dashboard?tab=users"
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition w-full text-center"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

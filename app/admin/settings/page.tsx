"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useState } from "react";

export default function AdminSettingsPage() {
  const [siteName, setSiteName] = useState("Nirdeshona LMS");
  const [defaultRole, setDefaultRole] = useState("subscriber");

  const handleSave = () => {
    alert("Settings saved (implement Firestore save logic here)");
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-start p-6 bg-gray-50">
        <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
          <h1 className="text-xl font-semibold mb-4">Site Settings</h1>

          <label className="block mt-4 mb-1 font-medium">Site Name</label>
          <input
            type="text"
            className="w-full border rounded-md px-3 py-2"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />

          <label className="block mt-4 mb-1 font-medium">Default User Role</label>
          <select
            className="w-full border rounded-md px-3 py-2"
            value={defaultRole}
            onChange={(e) => setDefaultRole(e.target.value)}
          >
            <option value="subscriber">Subscriber</option>
            <option value="premium-user">Premium User</option>
            <option value="instructor">Instructor</option>
            <option value="moderator">Moderator</option>
          </select>

          <button
            onClick={handleSave}
            className="mt-6 w-full bg-gray-800 text-white px-4 py-2 rounded-md hover:bg-gray-900"
          >
            Save Settings
          </button>

          <div className="mt-4 text-sm">
            <Link href="/admin/dashboard?tab=settings" className="text-blue-600 underline">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

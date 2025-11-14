"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserCircleIcon, PencilSquareIcon, ChatBubbleOvalLeftEllipsisIcon, DocumentTextIcon } from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Welcome, {user.displayName || "User"}!</h1>
        <p className="text-gray-600">Here’s your overview</p>
      </div>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card title="Profile" icon={UserCircleIcon} value="View / Edit" bg="bg-blue-100" />
        <Card title="Posts" icon={DocumentTextIcon} value="Manage Posts" bg="bg-green-100" />
        <Card title="Messages" icon={ChatBubbleOvalLeftEllipsisIcon} value="Check Inbox" bg="bg-yellow-100" />
        <Card title="Edit Profile" icon={PencilSquareIcon} value="Update Info" bg="bg-purple-100" />
      </div>

      {/* User Info */}
      <div className="bg-white p-6 rounded-2xl shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-700">
          <Info label="Email" value={user.email} />
          <Info label="UID" value={user.uid} />
          <Info label="Display Name" value={user.displayName || "N/A"} />
          <Info label="Last Login" value={user.metadata?.lastSignInTime || "N/A"} />
          <Info label="Account Created" value={user.metadata?.creationTime || "N/A"} />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <ActionCard title="Edit Profile" desc="Update your personal info" icon={PencilSquareIcon} />
        <ActionCard title="View Posts" desc="Manage all your posts" icon={DocumentTextIcon} />
        <ActionCard title="Check Messages" desc="Read and reply to messages" icon={ChatBubbleOvalLeftEllipsisIcon} />
        <ActionCard title="Account Settings" desc="Change password or settings" icon={UserCircleIcon} />
      </div>
    </div>
  );
}

// 🔹 Card Component
function Card({ title, value, icon: Icon, bg }: { title: string; value: string; icon: any; bg: string }) {
  return (
    <div className={`flex items-center p-4 rounded-xl shadow ${bg}`}>
      <Icon className="w-10 h-10 text-gray-700 mr-4" />
      <div>
        <p className="text-gray-600">{title}</p>
        <p className="font-bold text-lg">{value}</p>
      </div>
    </div>
  );
}

// 🔹 Info Component
function Info({ label, value }: { label: string; value: string }) {
  return (
    <p>
      <span className="font-semibold">{label}: </span>
      {value || "N/A"}
    </p>
  );
}

// 🔹 ActionCard Component
function ActionCard({ title, desc, icon: Icon }: { title: string; desc: string; icon: any }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow hover:shadow-lg transition cursor-pointer flex items-center gap-4">
      <Icon className="w-10 h-10 text-blue-600" />
      <div>
        <p className="font-semibold text-lg">{title}</p>
        <p className="text-gray-500">{desc}</p>
      </div>
    </div>
  );
}

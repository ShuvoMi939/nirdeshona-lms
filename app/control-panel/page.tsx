"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Link from "next/link";
import {
  UserCircleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function ControlPanelPage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const u = auth.currentUser;
    if (u) setUser(u);
  }, []);

  const formatLocalDateTime = (dateStr: string | undefined | null) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleString(undefined, {
      hour12: true,
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <main className="min-h-fit bg-white p-5 border border-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          Welcome, {user?.displayName || "Admin"}!
        </h1>
        <p className="text-gray-600">Here’s your overview</p>
      </div>

      {/* Quick Access Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickCard icon={UserCircleIcon} value="Manage Users" link="/control-panel/users" />
        <QuickCard icon={Cog6ToothIcon} value="System Settings" link="/control-panel/settings" />
        <QuickCard icon={ChartBarIcon} value="View Reports" link="/control-panel/reports" />
        <QuickCard icon={WrenchScrewdriverIcon} value="Admin Tools" link="/control-panel/tools" />
      </div>

      {/* Account Info Section */}
      <div className="bg-gray-20 border-[1.5px] border-gray-200 p-5">
        <h2 className="text-xl font-semibold text-gray-600 mb-4 border-b-[1.5px] border-gray-200 pb-2">
          Your Account
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-gray-600">
          <Info label="Email" value={user?.email || "N/A"} />
          <Info label="UID" value={user?.uid || "N/A"} />
          <Info label="Display Name" value={user?.displayName || "N/A"} />
          <Info label="Role" value="Admin" />
          <Info label="Last Login" value={formatLocalDateTime(user?.metadata?.lastSignInTime)} />
          <Info label="Created At" value={formatLocalDateTime(user?.metadata?.creationTime)} />
        </div>
      </div>
    </main>
  );
}

/* ---------------- QUICK CARD ---------------- */
function QuickCard({ icon: Icon, value, link }: any) {
  return (
    <Link
      href={link}
      className="bg-gray-20 border-[1.5px] border-gray-200 p-5 shadow hover:shadow-sm transition transform hover:-translate-y-1 flex gap-4 items-center cursor-pointer"
    >
      <Icon className="w-10 h-10 text-gray-600" />
      <div>
        <p className="font-bold text-md text-gray-600">{value}</p>
      </div>
    </Link>
  );
}

/* ---------------- INFO ROW ---------------- */
function Info({ label, value }: { label: string; value: string }) {
  return (
    <p className="bg-white border border-gray-200 px-3 py-2">
      <span className="font-semibold">{label}:</span> {value || "N/A"}
    </p>
  );
}

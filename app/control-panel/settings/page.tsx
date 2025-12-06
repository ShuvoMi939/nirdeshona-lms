"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import Loading from "@/components/Loading";
import PermissionsSection from "@/components/settings/PermissionsSection";

type Role = { id: number; name: string };
type Tab = "General" | "Permissions" | "Roles";
const TABS: Tab[] = ["General", "Permissions", "Roles"];

export default function SettingsPage() {
  // Initialize active tab from localStorage
  const [activeTab, setActiveTab] = useState<Tab>(() => {
    const stored = localStorage.getItem("settingsActiveTab") as Tab | null;
    return stored && TABS.includes(stored) ? stored : "General";
  });

  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);

  // Save active tab whenever it changes
  useEffect(() => {
    localStorage.setItem("settingsActiveTab", activeTab);
  }, [activeTab]);

  // Fetch roles for "Roles" tab
  const fetchRoles = async () => {
    try {
      setLoadingRoles(true);
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch("/api/roles/list", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setRoles(data.roles);
    } catch (err: any) {
      console.error("Failed to fetch roles:", err.message);
    } finally {
      setLoadingRoles(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  return (
    <div className="p-6 bg-white border border-gray-200 space-y-6 min-h-screen">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-300">
        {TABS.map((tab) => (
          <button
            key={tab}
            className={`px-4 py-2 -mb-px font-medium border-b-2 transition ${
              activeTab === tab
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-600 hover:text-blue-600 hover:border-blue-400"
            }`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "General" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">General Settings</h2>
            <p className="text-gray-600">Your general settings go here.</p>
          </div>
        )}

        <div className="overflow-x-auto">
          {activeTab === "Permissions" && <PermissionsSection />}
        </div>

        {activeTab === "Roles" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Roles</h2>
            {loadingRoles ? (
              <Loading />
            ) : (
              <ul className="list-disc ml-5">
                {roles.map((r) => (
                  <li key={r.id}>{r.name}</li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

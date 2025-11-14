"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  UserCircleIcon,
  ChatBubbleOvalLeftEllipsisIcon,
  RectangleStackIcon,
  Cog6ToothIcon,
  ArrowRightStartOnRectangleIcon, // ✅ modern replacement
} from "@heroicons/react/24/outline";

const menu = [
  { name: "Dashboard", icon: HomeIcon, path: "/dashboard" },
  { name: "Profile", icon: UserCircleIcon, path: "/dashboard/profile" },
  { name: "Posts", icon: RectangleStackIcon, path: "/dashboard/posts" },
  { name: "Messages", icon: ChatBubbleOvalLeftEllipsisIcon, path: "/dashboard/messages" },
  { name: "Settings", icon: Cog6ToothIcon, path: "/dashboard/settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/auth/login");
      else setUser(u);
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md p-6 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-6 text-blue-600">Dashboard</h2>
          <nav className="space-y-2">
            {menu.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center space-x-3 p-2 rounded-lg transition ${
                  pathname === item.path
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center space-x-2 text-red-600 hover:text-red-700"
        >
          <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
}

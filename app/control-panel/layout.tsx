"use client";

import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import "../globals.css";
import "nprogress/nprogress.css";
import Loading from "@/components/Loading";
import NothingFound from "@/components/NothingFound";

import {
  HomeIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  DocumentTextIcon,
  FolderIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon,
  ArrowLeftStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

export default function ControlPanelLayout({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) return router.push("/auth/login");

      try {
        const token = await user.getIdToken();

        const res = await fetch("/api/users/get-role", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ email: user.email }),
        });

        const data = await res.json();
        setRole(res.ok && data.role === "admin" ? "admin" : "denied");
      } catch {
        setRole("denied");
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [router]);

  if (loading) return <Loading />;

  if (role === "denied") return <NothingFound message="404 — Page Not Found" linkText="Go to Home" linkHref="/" />;

  const links = [
    { name: "Dashboard", href: "/control-panel", icon: HomeIcon },
    { name: "User Management", href: "/control-panel/users", icon: UserGroupIcon },
    { name: "User Roles", href: "/control-panel/roles", icon: ShieldCheckIcon },
    { name: "Posts", href: "/control-panel/posts", icon: DocumentTextIcon },
    { name: "Categories", href: "/control-panel/categories", icon: FolderIcon },
    { name: "Settings", href: "/control-panel/settings", icon: Cog6ToothIcon },
    { name: "Reports", href: "/control-panel/reports", icon: ChartBarIcon },
    { name: "Tools", href: "/control-panel/tools", icon: WrenchScrewdriverIcon },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/auth/login");
  };

  return (
    <>
      <Navbar />

      {/* MOBILE HORIZONTAL NAVBAR (ONLY SHOW ON SMALL DEVICES) */}
      <div className="lg:hidden bg-white border-b-[1.5px] border-gray-200 shadow-sm p-2 flex gap-2 overflow-x-auto mobile-scrollbar-admin">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-1 px-3 py-2 whitespace-nowrap border
                ${isActive ? "bg-gray-200 border-gray-300" : "border-gray-300"}
              `}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}

        <button
          onClick={handleLogout}
          className="flex items-center gap-1 px-3 py-2 whitespace-nowrap border border-red-400 text-red-600"
        >
          <ArrowLeftStartOnRectangleIcon className="w-5 h-5" />
          Logout
        </button>
      </div>

      <div className="min-h-fit flex bg-gray-100">

        {/* DESKTOP/LARGE DEVICE SIDEBAR (UNCHANGED) */}
        <aside className="hidden lg:flex w-64 bg-white shadow-sm border-r border-gray-200 p-6 flex-col justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-8">Admin Panel</h2>

            <nav className="flex flex-col gap-2 text-gray-600">
              {links.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 flex items-center gap-3 transition border border-gray-300
                      ${isActive ? "bg-gray-200 text-gray-600" : "hover:bg-gray-200"}
                    `}
                  >
                    <item.icon
                      className={`w-6 h-6 ${isActive ? "text-gray-600" : "text-gray-600"}`}
                    />
                    <span className={`font-medium`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <button
            onClick={handleLogout}
            className="mt-10 px-3 py-2 flex items-center gap-3 text-red-600 font-semibold
                       border border-red-300 hover:bg-red-50 transition"
          >
            <ArrowLeftStartOnRectangleIcon className="w-6 h-6" />
            Logout
          </button>
        </aside>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 overflow-x-auto">{children}</main>
      </div>

      <Footer />
    </>
  );
}

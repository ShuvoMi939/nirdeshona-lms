"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css"; // Import NProgress styles
import {
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  UserIcon,
  HomeIcon,
  InformationCircleIcon,
  BriefcaseIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

// Configure NProgress to disable the spinner
NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.1 });

// Navigation links
const links = [
  { href: "/", label: "Home", icon: <HomeIcon className="w-5 h-5 inline mr-2" /> },
  { href: "/about", label: "About", icon: <InformationCircleIcon className="w-5 h-5 inline mr-2" /> },
  { href: "/services", label: "Services", icon: <BriefcaseIcon className="w-5 h-5 inline mr-2" /> },
  { href: "/contact", label: "Contact", icon: <PhoneIcon className="w-5 h-5 inline mr-2" /> },
];

const dashboardLinks = [
  { href: "/dashboard/profile", label: "Profile" },
  { href: "/dashboard/settings", label: "Settings" },
  { href: "/dashboard/feed", label: "Feed" },
  { href: "/dashboard/courses", label: "Courses" },
  { href: "/dashboard/posts", label: "Posts" },
  { href: "/dashboard/support", label: "Support" },
];

export default function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const pathname = usePathname();

  // ---------- NProgress Setup ----------
  useEffect(() => {
    NProgress.start();
    const timer = setTimeout(() => NProgress.done(), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 text-blue-600 text-2xl font-bold">
          <Image src="/ni-logo-black.png" alt="Logo" width={40} height={40} style={{ height: 40, width: "auto" }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center space-x-8">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`text-gray-700 hover:text-blue-600 transition ${pathname === href ? "font-semibold" : ""}`}
            >
              {label}
            </Link>
          ))}

          {/* Dashboard dropdown */}
          <div className="relative group">
            <button className="text-gray-700 hover:text-blue-600 transition">Dashboard</button>
            <div className="absolute left-0 top-full mt-2 hidden w-40 flex-col rounded-md bg-white p-2 shadow-lg group-hover:flex">
              {dashboardLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="block rounded px-3 py-1 text-sm text-gray-700 hover:bg-blue-100 hover:text-blue-600 transition"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {/* Search box */}
          <div className="relative hidden lg:block">
            <input
              type="text"
              placeholder="Search..."
              className="rounded-full border border-gray-300 bg-gray-100 px-4 py-1.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute right-3 top-2.5 w-5 h-5 text-gray-400" />
          </div>

          {/* Login icon */}
          <Link
            href="/auth/login"
            className="text-gray-700 hover:text-blue-600 transition text-xl"
            aria-label="Login"
          >
            <UserIcon className="w-5 h-5 inline" />
          </Link>
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center md:hidden space-x-4">
          <button
            onClick={() => setSearchOpen((v) => !v)}
            aria-label="Toggle search"
            className="text-gray-700 hover:text-blue-600 transition text-xl"
          >
            <MagnifyingGlassIcon className="w-5 h-5" />
          </button>

          <Link href="/auth/login" aria-label="Login" className="text-gray-700 hover:text-blue-600 transition text-xl">
            <UserIcon className="w-5 h-5" />
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle mobile menu"
            className="text-gray-700 hover:text-blue-600 transition text-2xl"
          >
            {mobileOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile search input */}
      {isSearchOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-3 md:hidden">
          <input
            type="text"
            placeholder="Search..."
            className="w-full rounded border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-1"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="md:hidden px-2 pt-2 pb-3 space-y-1 bg-white shadow-md">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-3 py-2 text-gray-700 hover:bg-gray-100 rounded"
              onClick={() => setMobileOpen(false)}
            >
              {label}
            </Link>
          ))}

          {/* Dashboard submenu */}
          <div className="border-t border-gray-200 pt-2">
            <button
              onClick={() => setDashboardOpen(!dashboardOpen)}
              className="flex w-full items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <span>Dashboard</span>
              {dashboardOpen ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </button>
            {dashboardOpen && (
              <div className="ml-4 mt-2 flex flex-col space-y-2">
                {dashboardLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="block px-3 py-1 text-gray-700 hover:bg-blue-100 hover:text-blue-600 rounded"
                    onClick={() => setMobileOpen(false)}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

"use client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";

export default function AdminDashboard() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-gray-50 p-6">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          <Link href="/admin/users" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-2">Manage Users</h2>
            <p className="text-gray-600">View, edit, or delete users</p>
          </Link>

          <Link href="/admin/courses" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-2">Manage Courses</h2>
            <p className="text-gray-600">View, edit, or delete courses</p>
          </Link>

          <Link href="/admin/settings" className="bg-white rounded-lg shadow p-6 flex flex-col items-center hover:shadow-lg transition">
            <h2 className="text-lg font-semibold mb-2">Settings</h2>
            <p className="text-gray-600">Configure site settings and permissions</p>
          </Link>
        </div>
      </div>
      <Footer />
    </>
  );
}

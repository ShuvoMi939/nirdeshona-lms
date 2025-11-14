"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);

    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Fetch user data from Firestore
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        setError("User record not found.");
        setLoading(false);
        return;
      }

      const userData = userSnap.data();

      // Check if user role is admin
      if (userData.role !== "admin") {
        setError("You are not authorized as an admin.");
        setLoading(false);
        return;
      }

      // ✅ Skip email verification for admin
      router.push("/admin/dashboard");
    } catch (err: any) {
      setError("Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[400px] flex flex-col gap-5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-white w-[30px] h-[30px] relative rounded-lg border border-gray-200">
              <Image src="/ni-fav.svg" alt="Logo" fill className="object-contain p-[2px]" />
            </div>
            Nirdeshona Admin
          </Link>

          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-md">
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Admin Login</h1>
              <p className="text-sm text-gray-500">Secure access for admin users only</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleAdminLogin} className="grid gap-4" noValidate autoComplete="off">
                {/* Error Message */}
                {error && (
                  <div className="border border-red-200 bg-red-50 text-red-700 text-xs p-3 rounded-md">
                    {error}
                  </div>
                )}

                {/* Email Input */}
                <FloatingLabelInput
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                {/* Password Input */}
                <div className="relative">
                  <FloatingLabelInput
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-3 text-gray-500"
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-red-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-800 transition w-full disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login as Admin"}
                </button>

                <div className="text-center text-sm text-gray-600 mt-2">
                  <Link href="/auth/login" className="underline hover:text-gray-800">
                    Login as regular user
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="text-gray-500 text-center text-xs">
            By logging in, you agree to our{" "}
            <Link href="/terms" className="underline hover:text-blue-600">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-blue-600">
              Privacy Policy
            </Link>.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Email not verified! Please check your inbox.");
        await sendEmailVerification(user);
        return;
      }

      router.push("/dashboard");
    } catch (err: any) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  // Google login
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Firestore reference to users collection
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "subscriber",
          createdAt: new Date()
        });
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome Back 👋</h2>

          {error && <p className="text-red-500 text-sm mb-2 text-center">{error}</p>}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="you@example.com"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium mb-1">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
          </form>

          <button
            onClick={handleGoogleLogin}
            className="w-full mt-3 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition flex items-center justify-center gap-2"
          >
            <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Sign in with Google
          </button>

          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link href="/auth/register" className="text-blue-600 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}


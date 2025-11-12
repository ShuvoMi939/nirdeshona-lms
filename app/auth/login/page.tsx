"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");

  // Load remembered credentials (only on client)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("rememberedEmail");
      const savedPassword = localStorage.getItem("rememberedPassword");
      if (savedEmail && savedPassword) {
        setEmail(savedEmail);
        setPassword(savedPassword);
        setRememberMe(true);
      }
    }
  }, []);

  // Email/Password login
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

      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
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

  // Google Login
  const handleGoogleLogin = async () => {
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "subscriber",
          createdAt: new Date(),
        });
      }

      router.push("/dashboard");
    } catch {
      setError("Google login failed. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="w-6 h-6 relative">
              <Image
                src="/ni-fav.svg"
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            Nirdeshona Inc.
          </Link>

          {/* Card */}
          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            {/* Title */}
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Welcome back</h1>
              <p className="text-sm text-gray-500">Login with your credentials</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleLogin} className="grid gap-4" noValidate autoComplete="off">
                {/* Email */}
                <div className="grid gap-1">
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder=" "
                    autoComplete="email"
                    className="px-3 py-1 rounded-md border h-10 text-md w-full border-gray-300"
                  />
                  <label htmlFor="email" className="text-sm text-gray-600">
                    Your Email
                  </label>
                </div>

                {/* Password */}
                <div className="grid gap-1 relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder=" "
                    autoComplete="current-password"
                    className="px-3 py-1 rounded-md border h-10 text-md w-full border-gray-300"
                  />
                  <label htmlFor="password" className="text-sm text-gray-600">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-2.5 text-gray-500"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                  </button>
                </div>

                {/* Remember & Forgot */}
                <div className="flex justify-between items-center text-sm -mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-blue-600"
                    />
                    Remember me
                  </label>

                  <Link href="/reset-password" className="text-blue-600 hover:underline">
                    Forgot password?
                  </Link>
                </div>

                {/* Error Message */}
                {error && <p className="text-sm text-red-600">{error}</p>}

                {/* Submit */}
                <button
                  type="submit"
                  className="bg-blue-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-blue-700 transition w-full"
                >
                  Login
                </button>

                {/* Google Login */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-red-600 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-red-700 transition w-full flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Sign in with Google
                </button>

                {/* Register Link */}
                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t border-gray-200">
                  Don’t have an account?
                  <Link href="/auth/register" className="underline underline-offset-4 text-blue-600">
                    Sign up
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer */}
          <div className="text-gray-500 text-center text-xs">
            By clicking continue, you agree to our
            <br />
            <Link href="/terms" className="hover:text-blue-600 underline underline-offset-4">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="hover:text-blue-600 underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

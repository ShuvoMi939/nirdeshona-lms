"use client";

import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Validate email format before submitting
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      // 🔍 Step 1: Check if user exists in Firestore
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("No account found with this email address.");
        setIsSubmitting(false);
        return;
      }

      const userData = querySnapshot.docs[0].data();

      // 🚫 Step 2: If user is admin, block reset
      if (userData.role === "admin") {
        setError("Admin accounts cannot reset password from here.");
        setIsSubmitting(false);
        return;
      }

      // ✅ Step 3: Send password reset email
      await sendPasswordResetEmail(auth, email, {
        url: "https://web.nirdeshona.com/auth/login", // Redirect after reset
        handleCodeInApp: true,
      });

      setMessage("Password reset email has been sent. Please check your inbox or spam folder.");
      setEmail("");
    } catch (err: any) {
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          {/* Logo Header */}
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-white w-[25px] h-[25px] relative rounded-lg border border-gray-200">
              <img src="/ni-fav.svg" alt="Logo" className="p-[2px]" />
            </div>
            Nirdeshona Inc.
          </Link>

          {/* Main Card */}
          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            {/* Title */}
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Reset Your Password</h1>
              <p className="text-sm text-gray-500">
                Enter your email and we’ll send you a reset link.
              </p>
            </div>

            {/* Form */}
            <div className="px-6">
              <form onSubmit={handleResetPassword} className="grid gap-4" noValidate autoComplete="off">
                {/* Feedback messages */}
                {(error || message) && (
                  <div
                    className={`border rounded-md p-3 text-xs ${
                      error
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {error || message}
                  </div>
                )}

                {/* Floating Label Email Input */}
                <FloatingLabelInput
                  label="Your Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  name="email"
                  required
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60"
                >
                  {isSubmitting ? "Sending..." : "Send Reset Link"}
                </button>

                {/* Back to Login */}
                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t border-gray-200">
                  <ArrowLeftIcon className="w-4 h-4" />
                  <Link href="/auth/login" className="underline underline-offset-4 text-gray-800">
                    Back to Login
                  </Link>
                </div>
              </form>
            </div>
          </div>

          {/* Footer Note */}
          <div className="text-gray-500 text-center text-xs">
            Need help?{" "}
            <Link href="/contact" className="hover:text-blue-600 underline underline-offset-4">
              Contact Support
            </Link>
            .
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}

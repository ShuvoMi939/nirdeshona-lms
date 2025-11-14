"use client";

import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from "firebase/auth";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SetNewPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const oobCode = searchParams.get("oobCode") || "";
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validCode, setValidCode] = useState(false);

  useEffect(() => {
    if (!oobCode) return;
    // Verify code validity
    verifyPasswordResetCode(auth, oobCode)
      .then(() => setValidCode(true))
      .catch(() => setError("Invalid or expired link."));
  }, [oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!newPassword || newPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await confirmPasswordReset(auth, oobCode, newPassword);
      setSuccess("Your password has been updated successfully!");
    } catch (err: any) {
      setError("Failed to reset password. The link may be expired.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Set New Password</h1>
            </div>

            <div className="px-6">
              {error && <p className="text-sm text-red-600 text-center bg-red-50 py-1 rounded-md border border-red-200">{error}</p>}
              {success && (
                <div className="flex flex-col gap-2 text-center">
                  <p className="text-sm text-green-700 bg-green-50 py-1 rounded-md border border-green-200">{success}</p>
                  <Link href="/auth/login" className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition inline-block">
                    Continue to Login
                  </Link>
                </div>
              )}

              {validCode && !success && (
                <form onSubmit={handleSubmit} className="grid gap-4">
                  <input
                    type="password"
                    placeholder="New Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="px-3 py-2 rounded-md border border-gray-300"
                    required
                    minLength={6}
                  />
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60"
                  >
                    {isSubmitting ? "Updating..." : "Set New Password"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

"use client";

import { useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Link from "next/link";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"sendOtp" | "verifyOtp">("sendOtp");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSendOtp = async () => {
    setError("");
    setMessage("");
    if (!email) return setError("Please enter your email");

    setLoading(true);
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setStep("verifyOtp");
        setMessage("OTP sent! Check your email.");
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setError("");
    setMessage("");
    if (!otp || !newPassword) return setError("Please fill all fields");

    setLoading(true);
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("Password reset successful! You can now login.");
        setStep("sendOtp");
        setEmail("");
        setOtp("");
        setNewPassword("");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Server error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          <Link href="/" className="flex items-center gap-2 self-center font-medium">
            <div className="bg-white w-[25px] h-[25px] relative rounded-lg border border-gray-200">
              <Image src="/ni-fav.svg" alt="Logo" fill className="object-contain p-[2px]" />
            </div>
            Nirdeshona Inc.
          </Link>

          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Reset Password</h1>
              <p className="text-sm text-gray-500">
                {step === "sendOtp" ? "Enter your email to receive OTP" : "Enter OTP and new password"}
              </p>
            </div>

            <div className="px-6 flex flex-col gap-4">
              {error && <p className="text-xs text-red-600 border bg-red-50 p-2 rounded">{error}</p>}
              {message && <p className="text-xs text-green-600 border bg-green-50 p-2 rounded">{message}</p>}

              {step === "sendOtp" && (
                <>
                  <FloatingLabelInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    onClick={handleSendOtp}
                    disabled={loading}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 w-full disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                </>
              )}

              {step === "verifyOtp" && (
                <>
                  <FloatingLabelInput
                    label="OTP"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />

                  <div className="relative">
                    <FloatingLabelInput
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
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
                    onClick={handleVerifyOtp}
                    disabled={loading}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 w-full disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Reset Password"}
                  </button>
                </>
              )}

              <div className="flex items-center justify-center text-sm text-gray-700 gap-2 pt-3">
                Remembered your password?
                <Link href="/auth/login" className="underline underline-offset-4 text-gray-800">
                  Login
                </Link>
              </div>
            </div>
          </div>

          <div className="text-gray-500 text-center text-xs">
            By resetting, you agree to our
            <br />
            <Link href="/terms" className="underline underline-offset-4">Terms of Service</Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline underline-offset-4">Privacy Policy</Link>.
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

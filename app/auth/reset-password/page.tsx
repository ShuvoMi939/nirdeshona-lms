"use client";

import { useState, useRef, useEffect } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Image from "next/image";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"email" | "otp">("email");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [otpMessage, setOtpMessage] = useState("");

  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Initialize resend timer from localStorage (persist across refresh)
  useEffect(() => {
    const stored = localStorage.getItem("otpResendExpire");
    if (stored) {
      const expireAt = Number(stored);
      const remaining = expireAt - Date.now();
      if (remaining > 0) setResendTimer(Math.ceil(remaining / 1000));
    }
  }, []);

  // Countdown for resend button
  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          localStorage.removeItem("otpResendExpire");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async (resend = false) => {
    if (!email) return setError("Please enter your email.");
    setError("");
    if (resend) setResendLoading(true);
    else setLoading(true);

    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, resend }),
      });
      const data = await res.json();

      if (res.ok) {
        setStep("otp");
        if (data.otpAlreadySent) setOtpMessage(data.message);
        else setOtpMessage("OTP sent successfully! Check your email.");

        // Start 60s resend timer
        if (resend || !data.otpAlreadySent) {
          const expireAt = Date.now() + 60 * 1000;
          localStorage.setItem("otpResendExpire", String(expireAt));
          setResendTimer(60);
        }
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      if (resend) setResendLoading(false);
      else setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join("");
    if (otpString.length !== 6 || !newPassword) return setError("Enter complete OTP and new password.");
    setError(""); setLoading(true);

    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: otpString, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess("Password reset successfully! Redirecting to login...");
        setTimeout(() => window.location.href = "/auth/login", 2000);
      } else {
        setError(data.error || "Failed to verify OTP");
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) otpRefs.current[index + 1]?.focus();
    if (!value && index > 0) otpRefs.current[index - 1]?.focus();
  };

  return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-8 bg-gray-50">
        <div className="w-full max-w-[350px] flex flex-col gap-5">
          <div className="flex items-center gap-2 self-center font-medium">
            <div className="bg-white w-[25px] h-[25px] relative rounded-lg border border-gray-200">
              <Image src="/ni-fav.svg" alt="Logo" fill className="object-contain p-[2px]" />
            </div>
            Nirdeshona Inc.
          </div>

          <div className="bg-white text-black flex flex-col gap-5 rounded-xl border border-gray-200 py-6 shadow-sm">
            <div className="text-center px-6 border-b border-gray-200 pb-3">
              <h1 className="font-semibold text-xl">Reset Password</h1>
              <p className="text-sm text-gray-500">Use OTP sent to your email</p>
            </div>

            <div className="px-6 flex flex-col gap-4">
              {error && <p className="text-red-600 text-xs border bg-red-50 border-red-200 p-2 rounded">{error}</p>}
              {success && <p className="text-green-600 text-xs border bg-green-50 border-green-200 p-2 rounded">{success}</p>}
              {otpMessage && <p className="text-blue-600 text-xs border bg-blue-50 border-blue-200 p-2 rounded">{otpMessage}</p>}

              {step === "email" && (
                <>
                  <FloatingLabelInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                  <button
                    onClick={() => handleSendOtp(false)}
                    disabled={loading}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60"
                  >
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </button>
                  <button
                    onClick={() => window.location.href = "/auth/login"}
                    className="text-gray-700 hover:underline text-sm mt-2"
                  >
                    Back to Login
                  </button>
                </>
              )}

              {step === "otp" && (
                <>
                  <div className="flex justify-between gap-2 mt-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        type="text"
                        maxLength={1}
                        value={digit}
                        ref={(el) => {
                          otpRefs.current[index] = el;
                        }}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        className="w-10 h-10 text-center border border-gray-300 rounded-md focus:border-gray-700 focus:outline-none text-lg"
                      />
                    ))}
                  </div>

                  <div className="relative mt-4">
                    <FloatingLabelInput
                      label="New Password"
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-3 text-gray-500">
                      {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    onClick={handleVerifyOtp}
                    disabled={loading || otp.some(d => d === "")}
                    className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 transition w-full disabled:opacity-60 mt-2"
                  >
                    {loading ? "Verifying..." : "Verify OTP & Reset Password"}
                  </button>

                  {/* Resend OTP */}
                  <button
                    onClick={() => handleSendOtp(true)}
                    disabled={resendTimer > 0 || resendLoading}
                    className="text-sm text-gray-700 hover:underline mt-2 disabled:opacity-60"
                  >
                    {resendLoading ? "Sending..." : resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                  </button>

                  <button
                    onClick={() => setStep("email")}
                    className="text-gray-700 hover:underline text-sm mt-2"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

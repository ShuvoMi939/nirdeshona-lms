"use client";

import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingLabelInput from "@/components/FloatingLabelInput";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [unverifiedUser, setUnverifiedUser] = useState<any>(null);
  const [resendSuccess, setResendSuccess] = useState("");
  const [resendLoading, setResendLoading] = useState(false);

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

  // ---------------------------------------------------
  //                EMAIL + PASSWORD LOGIN
  // ---------------------------------------------------
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResendSuccess("");
    setUnverifiedUser(null);

    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Check Neon DB
      const neonRes = await fetch("/api/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const neonData = await neonRes.json();

      if (!neonData.exists) {
        setLoading(false);
        setError("No account found with this email address.");
        return;
      }

      // 2️⃣ Firebase login
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(
          "This email is not yet verified. Please check your inbox or click below to resend verification."
        );
        setUnverifiedUser({ email, password });
        setLoading(false);
        return;
      }

      // Remember Me
      if (rememberMe && typeof window !== "undefined") {
        localStorage.setItem("rememberedEmail", email);
        localStorage.setItem("rememberedPassword", password);
      } else if (typeof window !== "undefined") {
        localStorage.removeItem("rememberedEmail");
        localStorage.removeItem("rememberedPassword");
      }

      setLoading(false);
      router.push("/dashboard");
    } catch (err: any) {
      setLoading(false);

      if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/user-not-found") {
        setError("No account found with this email address.");
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many failed attempts. Please try again later.");
      } else {
        setError("Login failed. Please try again.");
      }
    }
  };

  // ---------------------------------------------------
  //            RESEND VERIFICATION EMAIL
  // ---------------------------------------------------
  const handleResendVerification = async () => {
    if (!unverifiedUser) return;

    setError("");
    setResendSuccess("");
    setResendLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        unverifiedUser.email,
        unverifiedUser.password
      );
      const user = userCredential.user;

      if (user.emailVerified) {
        setResendSuccess("Your email is already verified. You can log in now.");
        setUnverifiedUser(null);
        setResendLoading(false);
        return;
      }

      await sendEmailVerification(user);
      setResendSuccess("Verification email sent! Please check your inbox.");
      setUnverifiedUser(null);
    } catch {
      setError("Failed to resend verification email. Try again.");
    } finally {
      setResendLoading(false);
    }
  };

  // ---------------------------------------------------
  //                     GOOGLE LOGIN
  // ---------------------------------------------------
  const handleGoogleLogin = async () => {
    setError("");

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // ⭐ Check if user already exists in Neon DB
      const check = await fetch("/api/login-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      });

      const data = await check.json();

      // ⭐ If user does NOT exist → create in Neon DB
      if (!data.exists) {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            uid: user.uid,
            name: user.displayName || "Unnamed User",
            email: user.email,
            avatar_url: user.photoURL,
          }),
        });
      }

      router.push("/dashboard");
    } catch (err) {
      setError("Google login failed. Please try again.");
    }
  };

  // ---------------------------------------------------
  //                         UI
  // ---------------------------------------------------
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
              <h1 className="font-semibold text-xl">Welcome back</h1>
              <p className="text-sm text-gray-500">Login with your credentials</p>
            </div>

            <div className="px-6">
              <form onSubmit={handleLogin} className="grid gap-4" noValidate autoComplete="off">
                <FloatingLabelInput
                  label="Your Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

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

                {/* ✅ Remember Me + Forgot Password */}
                <div className="flex justify-between items-center text-sm -mt-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="accent-gray-700"
                    />
                    Remember me
                  </label>

                  <Link
                    href="/auth/reset-password"
                    className="text-gray-700 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                {error && (
                  <p className="text-red-600 text-xs border bg-red-50 border-red-200 p-2 rounded">{error}</p>
                )}

                {unverifiedUser && (
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    className="text-xs bg-gray-200 px-2 py-1 rounded"
                    disabled={resendLoading}
                  >
                    {resendLoading ? "Sending..." : "Resend verification email"}
                  </button>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 w-full disabled:opacity-60"
                >
                  {loading ? "Logging in..." : "Login"}
                </button>

                <div className="relative flex items-center -my-2">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="mx-2 text-gray-400 text-sm font-medium">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="bg-gray-700 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800 w-full flex items-center justify-center gap-2"
                >
                  <img src="/google-icon.svg" alt="Google" className="w-5 h-5" /> Login with Google
                </button>

                <div className="flex items-center justify-center text-sm text-gray-700 gap-2 -mx-6 pt-3 border-t border-gray-200">
                  New here?
                  <Link href="/auth/register" className="underline underline-offset-4">
                    Create Account
                  </Link>
                </div>
              </form>
            </div>
          </div>

          <div className="text-gray-500 text-center text-xs">
            By logging in, you agree to our
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

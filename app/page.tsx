import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <h1 className="text-4xl font-bold text-center mb-4">
          Welcome to Nirdeshona LMS 🚀
        </h1>
        <p className="text-lg text-gray-700 text-center mb-8">
          Learn, Teach, and Grow with our interactive online courses.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/auth/register"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-center"
          >
            Get Started
          </Link>
          <Link
            href="/auth/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-center"
          >
            Login
          </Link>
        </div>
      </main>

      <Footer />
    </>
  );
}

"use client";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      {/* Spinner */}
      <div className="w-12 h-12 border-4 border-blue-400 border-dashed rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-lg">Loading...</p>
    </div>
  );
}

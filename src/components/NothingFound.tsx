"use client";

import Link from "next/link";
import { ExclamationCircleIcon } from "@heroicons/react/24/outline";

type NothingFoundProps = {
  message?: string;
  linkText?: string;
  linkHref?: string;
};

export default function NothingFound({
  message = "Nothing found!",
  linkText = "Go back home",
  linkHref = "/",
}: NothingFoundProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
      <ExclamationCircleIcon className="w-16 h-16 text-gray-400 mb-4" />
      <h1 className="text-2xl font-semibold text-gray-700 mb-2">{message}</h1>
      <p className="text-gray-500 mb-4">We couldn’t find what you’re looking for.</p>
      <Link
        href={linkHref}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        {linkText}
      </Link>
    </div>
  );
}

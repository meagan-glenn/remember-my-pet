"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("Unhandled error:", error);
    }
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-amber-50 mb-2">
        Something unexpected happened
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Don&apos;t worry — your work is saved on this device. Try refreshing the
        page.
      </p>
      <button
        onClick={() => reset()}
        className="rounded-full bg-amber-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors dark:bg-amber-500 dark:hover:bg-amber-400 dark:text-gray-900"
      >
        Refresh page
      </button>
    </div>
  );
}

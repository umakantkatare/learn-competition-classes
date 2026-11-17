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
    console.error("Global Application Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
          <h1 className="text-3xl font-bold">Something went wrong!</h1>

          <p>An unexpected application error occurred.</p>

          <button
            onClick={() => reset()}
            className="rounded-lg bg-black px-5 py-2.5 text-white"
          >
            Try Again
          </button>
        </main>
      </body>
    </html>
  );
}

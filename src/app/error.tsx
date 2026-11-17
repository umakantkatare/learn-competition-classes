"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log error to monitoring service
    console.error("Application Error:", error);
  }, [error]);

  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
            <AlertTriangle className="size-10 text-destructive" />
          </div>
        </div>

        {/* Error Content */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
            Something went wrong
          </p>

          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Unexpected Error!
          </h1>

          <p className="text-muted-foreground">
            We encountered an unexpected problem while processing your request.
            Please try again.
          </p>
        </div>

        {/* Error ID */}
        {error.digest && (
          <div className="mt-6 rounded-lg border bg-muted/50 px-4 py-3">
            <p className="text-xs text-muted-foreground">Error Reference</p>
            <p className="mt-1 font-mono text-sm">{error.digest}</p>
          </div>
        )}

        {/* Development Error */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-destructive">
              Development Details
            </p>
            <p className="break-words text-xs text-muted-foreground">
              {error.message}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => reset()} className="gap-2">
            <RefreshCw className="size-4" />
            Try Again
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            render={<Link href="/" />}
          >
            <Home className="size-4" />
            Back to Home
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            If this problem continues, please contact our support team.
          </p>
        </div>
      </div>
    </main>
  );
}

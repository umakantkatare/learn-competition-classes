import Link from "next/link";
import { Home, LockKeyhole, LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg text-center">
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-primary/10">
            <LockKeyhole className="size-10 text-primary" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Authentication Required
          </p>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            401
          </h1>

          <h2 className="text-2xl font-bold tracking-tight">
            You're not authenticated
          </h2>

          <p className="mx-auto max-w-md text-muted-foreground">
            You need to sign in to access this page. Please log in with your
            account to continue your learning journey.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/login" />} className="gap-2">
            <LogIn className="size-4" />
            Sign In
          </Button>

          <Button
            variant="outline"
            render={<Link href="/" />}
            className="gap-2"
          >
            <Home className="size-4" />
            Back to Home
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account yet?
          </p>

          <Link
            href="/register"
            className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
          >
            Create an account
          </Link>
        </div>
      </div>
    </main>
  );
}

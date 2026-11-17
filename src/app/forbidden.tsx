
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Home,
  LockKeyhole,
  ShieldAlert,
} from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Forbidden() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-lg text-center">

        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex size-20 items-center justify-center rounded-2xl bg-destructive/10">
            <LockKeyhole className="size-10 text-destructive" />
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-destructive">
            Access Denied
          </p>

          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl">
            403
          </h1>

          <h2 className="text-2xl font-bold tracking-tight">
            Forbidden Access
          </h2>

          <p className="mx-auto max-w-md text-muted-foreground">
            You don't have permission to access this page.
            Please contact your administrator if you believe
            this is a mistake.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Button render={<Link href="/" />} className="gap-2">
            <Home className="size-4" />
            Back to Home
          </Button>

          <Button
            variant="outline"
            className="gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="size-4" />
            Go Back
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-10 border-t pt-6">
          <p className="text-sm text-muted-foreground">
            Need access? Contact your administrator for assistance.
          </p>
        </div>

      </div>
    </main>
  );
}

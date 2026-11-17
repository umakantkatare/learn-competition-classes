"use client"
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Home,
  Search,
} from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-2xl text-center">

        {/* 404 */}
        <div className="relative mb-6">
          <h1 className="text-[140px] font-extrabold leading-none tracking-tighter text-primary/10 sm:text-[190px]">
            404
          </h1>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Page Not Found
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className={cn(buttonVariants({ size: "lg" }), "gap-2")}
          >
            <Home className="size-4" />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "gap-2"
            )}
          >
            <ArrowLeft className="size-4" />
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}

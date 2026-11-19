"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Home,
  Search,
} from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface NotFoundProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  showBackButton?: boolean;
}

export default function NotFound({
  title = "Page Not Found",
  description = "The page you're looking for doesn't exist or may have been moved.",
  backHref = "/",
  backLabel = "Back to Home",
  showBackButton = true,
}: NotFoundProps) {
  return (
    <main className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="mx-auto w-full max-w-2xl text-center">
        {/* 404 Illustration */}
        <div className="relative mb-6">
          <h1 className="text-[140px] font-extrabold leading-none tracking-tighter text-primary/10 sm:text-[190px]">
            404
          </h1>

          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex size-20 items-center justify-center rounded-2xl border border-border bg-background shadow-lg sm:size-24">
              <Search className="size-10 text-primary sm:size-12" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">
            Oops! Something went wrong
          </p>

          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h2>

          <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={backHref}
            className={cn(
              buttonVariants({ size: "lg" }),
              "gap-2"
            )}
          >
            <Home className="size-4" />
            {backLabel}
          </Link>

          {showBackButton && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft className="size-4" />
              Go Back
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
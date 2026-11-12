"use client";

import Link from "next/link";
import { Loader2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "../auth/sign-out-button";

interface NavbarActionsProps {
  onNavigate?: () => void;
}

export default function NavbarActions({
  onNavigate,
}: NavbarActionsProps) {
  const { data: session, isPending } = authClient.useSession();

  // Session loading state
  if (isPending) {
    return (
      <div className="flex items-center justify-center p-2">
        <Loader2 className="h-5 w-5 animate-spin text-brand-primary" />
      </div>
    );
  }

  // Logged-in user
  if (session?.user) {
    return (
      <div
        className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center"
        onClick={(event) => {
          const target = event.target as HTMLElement;
          const button = target.closest("button");

          if (button && !button.disabled) {
            onNavigate?.();
          }
        }}
      >
        <SignOutButton />
      </div>
    );
  }

  // Logged-out user
  return (
    <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-2 md:gap-3">
      {/* Login Button */}
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="
          inline-flex h-11 w-full items-center justify-center
          whitespace-nowrap rounded-full
          border border-brand-primary bg-transparent
          px-5 text-sm font-semibold text-foreground
          transition-all duration-200
          hover:bg-accent hover:text-accent-foreground
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2
          active:scale-[0.97]
          sm:w-auto
        "
      >
        Login
      </Link>

      {/* Sign Up Button */}
      <Link
        href="/sign-up"
        onClick={onNavigate}
        className="
          inline-flex h-11 w-full items-center justify-center
          whitespace-nowrap rounded-full
          bg-primary px-5 text-sm font-semibold
          text-primary-foreground shadow-sm
          transition-all duration-200
          hover:bg-brand-primary-hover hover:shadow-md
          focus-visible:outline-none focus-visible:ring-2
          focus-visible:ring-ring focus-visible:ring-offset-2
          active:scale-[0.97]
          sm:w-auto
        "
      >
        Sign Up
      </Link>
    </div>
  );
}
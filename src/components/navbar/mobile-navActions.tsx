"use client";

import Link from "next/link";
import { Loader2, LogIn, UserPlus } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { SignOutButton } from "../auth/sign-out-button";

interface MobileNavActionsProps {
  onNavigate: () => void;
}

export default function MobileNavActions({
  onNavigate,
}: MobileNavActionsProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-[#F5A800]" />
      </div>
    );
  }

  // Logged-in user: Show SignOutButton
  if (session?.user) {
    return (
      <div
        className="flex flex-col gap-3"
        onClick={(event) => {
          if (
            (event.target as HTMLElement).closest("button") &&
            !(event.target as HTMLElement).closest("button")?.disabled
          ) {
            onNavigate();
          }
        }}
      >
        <SignOutButton />
      </div>
    );
  }

  // Logged-out user: Show Login and Sign Up
  return (
    <div className="flex flex-col gap-3">
      <Link
        href="/sign-in"
        onClick={onNavigate}
        className="flex h-12 w-full items-center justify-center
          gap-2 rounded-full border-2 border-[#F5A800]
          text-sm font-semibold text-[#171717]
          transition-colors hover:bg-amber-50"
      >
        <LogIn size={18} />
        Login
      </Link>

      <Link
        href="/sign-up"
        onClick={onNavigate}
        className="flex h-12 w-full items-center justify-center
          gap-2 rounded-full bg-[#F5A800] text-sm font-semibold
          text-black shadow-sm transition-colors hover:bg-amber-500"
      >
        <UserPlus size={18} />
        Sign Up
      </Link>
    </div>
  );
}

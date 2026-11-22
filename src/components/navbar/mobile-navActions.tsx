
"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";

import { SignOutButton } from "../auth/sign-out-button";

interface MobileNavActionsProps {
  isPending: boolean;
  isAuthenticated: boolean;
  onNavigate: () => void;
}

interface MobileNavLinkProps {
  href: string;
  variant?: "outline" | "primary";
  children: ReactNode;
  onNavigate: () => void;
}

const linkStyles = {
  outline: `
    border-2 border-primary
    text-foreground
    hover:bg-primary/10
  `,
  primary: `
    bg-primary text-primary-foreground
    shadow-sm hover:bg-primary/90
  `,
};

function MobileNavLink({
  href,
  variant = "primary",
  children,
  onNavigate,
}: MobileNavLinkProps) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`
        flex h-12 w-full items-center justify-center
        rounded-full text-sm font-semibold
        transition-colors duration-200
        focus-visible:outline-none
        focus-visible:ring-2 focus-visible:ring-ring
        focus-visible:ring-offset-2
        ${linkStyles[variant]}
      `}
    >
      {children}
    </Link>
  );
}

export default function MobileNavActions({
  isPending,
  isAuthenticated,
  onNavigate,
}: MobileNavActionsProps) {
  // Authentication loading
  if (isPending) {
    return (
      <div
        className="flex justify-center py-4"
        role="status"
        aria-label="Loading authentication"
      >
        <Loader2 className="size-5 animate-spin text-primary" />
      </div>
    );
  }

  // Authenticated user
  if (isAuthenticated) {
    return <SignOutButton onSuccess={onNavigate} />;
  }

  // Guest actions
  return (
    <div className="flex flex-col gap-3">
      <MobileNavLink
        href="/sign-in"
        variant="outline"
        onNavigate={onNavigate}
      >
        Login
      </MobileNavLink>

      <MobileNavLink
        href="/sign-up"
        variant="primary"
        onNavigate={onNavigate}
      >
        Sign Up
      </MobileNavLink>
    </div>
  );
}

"use client";

import type { ReactNode } from "react";
import { authClient } from "@/lib/auth-client";

interface AppLayoutClientProps {
  children: ReactNode;
  navbar: ReactNode;
  footer: ReactNode;
}

export default function AppLayoutClient({
  children,
  navbar,
  footer,
}: AppLayoutClientProps) {
  const { isPending } = authClient.useSession();

  if (isPending) {
    return null;
  }

  return (
    <>
      {navbar}
      {children}
      {footer}
    </>
  );
}

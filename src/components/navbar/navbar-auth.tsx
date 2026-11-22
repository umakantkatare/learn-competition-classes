"use client";

import NavbarActions from "./navbar-actions";
import NavbarUserMenu from "./navbar-userMenu";

export interface NavbarUser {
  name: string;
  role?: string | null;
  image?: string | null;
}

interface NavbarAuthProps {
  user: NavbarUser | null;
  isPending: boolean;
  variant?: "desktop" | "mobile";
}

export default function NavbarAuth({
  user,
  isPending,
  variant = "desktop",
}: NavbarAuthProps) {
  if (isPending) {
    return (
      <div
        className="size-9 shrink-0 animate-pulse rounded-full bg-muted sm:size-10"
        role="status"
        aria-label="Loading user"
      />
    );
  }

  if (user) {
    return (
      <NavbarUserMenu
        name={user.name}
        role={user.role ?? "student"}
        avatar={user.image ?? undefined}
      />
    );
  }

  if (variant === "mobile") {
    return null;
  }

  return <NavbarActions />;
}

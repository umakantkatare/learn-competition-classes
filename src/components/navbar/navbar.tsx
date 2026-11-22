"use client";

import { authClient } from "@/lib/auth-client";
import DesktopNavbar from "./desktop-navbar";
import MobileNavbar from "./mobile-navbar";

export default function Navbar() {
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user
    ? {
        name: session.user.name,
        role: session.user.role ?? "student",
        image: session.user.image ?? undefined,
      }
    : null;

return (
  <div className="sticky top-0 z-50 w-full">
    {/* Desktop & Tablet */}
    <div className="hidden md:block">
      <DesktopNavbar
        user={user}
        isPending={isPending}
      />
    </div>

    {/* Mobile */}
    <div className="block md:hidden">
      <MobileNavbar
        user={user}
        isPending={isPending}
      />
    </div>
  </div>
);
}
"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";

import Logo from "../common/logo";

import MobileSidebar from "./mobile-sidebar";
import NavbarAuth, { type NavbarUser } from "./navbar-auth";

interface MobileNavbarProps {
  user: NavbarUser | null;
  isPending: boolean;
}

export default function MobileNavbar({
  user,
  isPending,
}: MobileNavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      <header
        className="
          mx-auto w-full rounded-xl
          border border-border
          bg-card/95 text-card-foreground
          shadow-sm backdrop-blur-md
          transition-colors
        "
      >
        <div
          className="
            relative flex min-h-16 items-center
            justify-between gap-3 px-3 py-2
            sm:min-h-[76px] sm:px-5
          "
        >
          {/* Hamburger */}
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-label={isOpen ? "Close menu" : "Open menu"}
            aria-expanded={isOpen}
            className="
              inline-flex size-10 shrink-0 items-center justify-center
              rounded-lg border border-border
              bg-background text-foreground
              transition-colors
              hover:bg-accent hover:text-accent-foreground
              focus-visible:outline-none
              focus-visible:ring-2 focus-visible:ring-ring
            "
          >
            {isOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
          </button>

          {/* Center Logo */}
          <div className="absolute left-1/2 -translate-x-1/2">
            <Logo width={56} height={56} />
          </div>

          {/* Profile / Authentication */}
          <div className="flex shrink-0 items-center justify-end">
            <NavbarAuth
              user={user}
              isPending={isPending}
              variant="mobile"
            />
          </div>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar
        isOpen={isOpen}
        onClose={closeSidebar}
      />
    </>
  );
}
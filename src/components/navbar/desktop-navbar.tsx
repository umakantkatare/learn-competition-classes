"use client";

import Logo from "../common/logo";

import NavbarLinks from "./navbar-links";
import NavbarAuth, { type NavbarUser } from "./navbar-auth";

import { Menu } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface DesktopNavbarProps {
  user: NavbarUser | null;
  isPending: boolean;
}

export default function DesktopNavbar({
  user,
  isPending,
}: DesktopNavbarProps) {
  return (
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
          flex min-h-16 items-center justify-between
          gap-3 px-3 py-2
          sm:px-5
          lg:min-h-[76px] lg:px-6
          xl:px-8
        "
      >
        {/* Logo */}
        <div className="flex shrink-0 items-center">
          <Logo width={56} height={56} />
        </div>

        {/* Desktop Navigation */}
        <nav
          aria-label="Main navigation"
          className="
            hidden flex-1 items-center justify-center
            px-3 lg:flex xl:px-6
          "
        >
          <NavbarLinks />
        </nav>

        {/* Authentication */}
        <div className="flex shrink-0 items-center justify-end gap-2">
          <NavbarAuth
            user={user}
            isPending={isPending}
          />

          {/* Tablet Navigation */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger
                className="
                  inline-flex size-10 items-center justify-center
                  rounded-lg border border-border
                  bg-background text-foreground
                  transition-colors
                  hover:bg-accent hover:text-accent-foreground
                  focus-visible:outline-none
                  focus-visible:ring-2 focus-visible:ring-ring
                "
                aria-label="Open navigation menu"
              >
                <Menu className="size-5" />
              </SheetTrigger>

              <SheetContent
                side="right"
                className="flex w-[85%] max-w-sm flex-col"
              >
                <SheetHeader>
                  <SheetTitle className="flex items-center">
                    <Logo width={48} height={48} />
                    <span className="sr-only">
                      Navigation menu
                    </span>
                  </SheetTitle>
                </SheetHeader>

                <nav
                  aria-label="Mobile navigation"
                  className="
                    mt-6 flex flex-1 flex-col
                    gap-5 overflow-y-auto
                  "
                >
                  <NavbarLinks />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
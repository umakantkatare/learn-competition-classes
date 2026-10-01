"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import NavbarSearch from "./navbar-search";
import MobileSidebar from "./mobile-sidebar";
import Logo from "../common/logo";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <header className="relative flex h-20 items-center justify-between border-b bg-white px-4 shadow-sm sm:h-24 sm:px-6">
        {/* Hamburger Button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gray-800 transition-colors hover:bg-amber-50"
        >
          {isOpen ? (
            <X size={26} strokeWidth={2} />
          ) : (
            <Menu size={26} strokeWidth={2} />
          )}
        </button>

        {/* Center Logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Logo width={55} height={55} />
        </div>

        {/* Search Button */}
        <div className="shrink-0">
          <NavbarSearch />
        </div>
      </header>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}

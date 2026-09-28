
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import MobileNavLinks from "./mobile-navLinks";
import MobileNavActions from "./mobile-navActions";


interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({
  isOpen,
  onClose,
}: MobileSidebarProps) {
  // Prevent background scrolling when sidebar is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close sidebar when Escape key is pressed
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-[60] bg-black/40
          transition-opacity duration-300 md:hidden
          ${
            isOpen
              ? "visible opacity-100"
              : "invisible opacity-0"
          }`}
      />

      {/* Sidebar */}
      <aside
        id="mobile-sidebar"
        aria-label="Mobile navigation"
        aria-hidden={!isOpen}
        className={`fixed right-0 top-0 z-[70]
          flex h-dvh w-[85%] max-w-sm
          flex-col bg-white shadow-2xl
          transition-transform duration-300 ease-in-out
          md:hidden
          ${
            isOpen
              ? "translate-x-0"
              : "translate-x-full"
          }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between
          border-b border-gray-100 px-5 py-4">

          <Link
            href="/"
            onClick={onClose}
            className="text-lg font-bold text-[#171717]"
          >
            LCC Institute
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="flex h-10 w-10 items-center
              justify-center rounded-full
              hover:bg-amber-50"
          >
            <X size={24} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          <MobileNavLinks onNavigate={onClose} />
        </div>

        {/* Sidebar Authentication Actions */}
        <div className="border-t border-gray-100 p-5">
          <MobileNavActions onNavigate={onClose} />
        </div>
      </aside>
    </>
  );
}
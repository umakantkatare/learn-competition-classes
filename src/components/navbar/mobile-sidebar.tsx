"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import MobileNavLinks from "./mobile-navLinks";
import MobileNavActions from "./mobile-navActions";
import NavbarActions from "./navbar-actions";
import NavbarLinks from "./navbar-links";

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  return (
    <Sheet
      open={isOpen}
      onOpenChange={(open: boolean) => {
        if (!open) onClose();
      }}
    >
      <SheetContent
        side="left"
        showCloseButton={false}
        className="
          flex h-dvh
          w-[85%] max-w-[380px]
          flex-col gap-0
          overflow-hidden
          border-r border-border
          bg-background p-0
          text-foreground
          shadow-2xl
          md:hidden
        "
      >
        {/* Accessible Title */}
        <SheetTitle className="sr-only">
          LCC Institute Mobile Navigation
        </SheetTitle>

        {/* Sidebar Header */}
        <div
          className="
          flex shrink-0 items-center
          justify-between gap-3
          border-b border-border
          px-5 py-4
        "
        >
          <Link
            href="/"
            onClick={onClose}
            className="
              text-lg font-bold
              tracking-tight text-foreground
              transition-colors
              hover:text-brand-primary
            "
          >
            LCC Institute
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="
              flex size-10 shrink-0
              items-center justify-center
              rounded-full
              text-muted-foreground
              transition-colors
              hover:text-brand-primary
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
            "
          >
            <X size={22} strokeWidth={1.8} />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div
          className="
          min-h-0 flex-1
          overflow-y-auto overscroll-contain
          px-5 py-6
        "
        >
          {/* <MobileNavLinks onNavigate={onClose} /> */}
          <NavbarLinks onNavigate={onClose}/>
        </div>

        {/* Authentication Actions */}
        <div
          className="
          shrink-0 border-t border-border
          bg-background p-5
          pb-[max(1.25rem,env(safe-area-inset-bottom))]
        "
        >
          {/* <MobileNavActions onNavigate={onClose} /> */}
          <NavbarActions onNavigate={onClose}/>
        </div>
      </SheetContent>
    </Sheet>
  );
}

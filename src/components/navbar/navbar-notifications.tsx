"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

interface NavbarNotificationsProps {
  unreadCount?: number;
}

export default function NavbarNotifications({
  unreadCount = 0,
}: NavbarNotificationsProps) {
  return (
    <Link
      href="/notifications"
      aria-label={`Notifications${
        unreadCount > 0 ? `, ${unreadCount} unread` : ""
      }`}
      className="relative flex h-12 w-12 shrink-0
        items-center justify-center rounded-full
        text-[#171717] transition-colors
        hover:bg-amber-50"
    >
      <Bell size={26} strokeWidth={1.8} />

      {/* Unread Indicator */}
      {unreadCount > 0 && (
        <span
          className="absolute right-2 top-2
            h-3 w-3 rounded-full
            border-2 border-white bg-red-500"
        />
      )}
    </Link>
  );
}

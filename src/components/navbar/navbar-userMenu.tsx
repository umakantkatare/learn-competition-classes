"use client";

import Image from "next/image";
import Link from "next/link";

import {
  ChevronDown,
  UserRound,
  BookOpen,
  FileText,
  CalendarDays,
  Settings,
  LogOut,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavbarUserMenuProps {
  name?: string;
  role?: string;
  avatar?: string;
  onLogout?: () => void;
}

const profileLinks = [
  {
    label: "My Profile",
    href: "/student/profile",
    icon: UserRound,
  },
  {
    label: "My Enrollments",
    href: "/student/enrollments",
    icon: BookOpen,
  },
  {
    label: "My Test Series",
    href: "/student/test-series",
    icon: FileText,
  },
  {
    label: "Live Class Schedule",
    href: "/student/live-classes",
    icon: CalendarDays,
  },
  {
    label: "Settings",
    href: "/student/settings",
    icon: Settings,
  },
];

export default function NavbarUserMenu({
  name = "Umakant",
  role = "Student",
  avatar = "/images/default-avatar.png",
  onLogout,
}: NavbarUserMenuProps) {
  return (
    <DropdownMenu>
      {/* Profile Trigger */}
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open student profile menu"
            className="flex shrink-0 items-center gap-3
        rounded-full p-1.5 transition-colors
        hover:bg-amber-50
        focus-visible:outline-none
        focus-visible:ring-2
        focus-visible:ring-[#F5A800]"
          >
            {/* Avatar */}
            <div
              className="relative h-12 w-12
          overflow-hidden rounded-full
          bg-amber-50 sm:h-14 sm:w-14"
            >
              <Image
                src={avatar}
                alt={`${name}'s profile`}
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>

            {/* User Details */}
            <div className="hidden flex-col items-start sm:flex">
              <span
                className="max-w-32 truncate
            text-base font-semibold text-[#171717]"
              >
                {name}
              </span>

              <span className="text-sm text-gray-500">{role}</span>
            </div>

            <ChevronDown size={18} className="hidden text-gray-500 sm:block" />
          </button>
        }
      />

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-xl border
          border-gray-100 bg-white p-2 shadow-xl"
      >
        {/* User Info */}
        <DropdownMenuLabel className="px-3 py-3">
          <div className="flex flex-col gap-1">
            <span
              className="truncate text-sm
              font-semibold text-gray-900"
            >
              {name}
            </span>

            <span
              className="text-xs font-normal
              text-gray-500"
            >
              {role}
            </span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Profile Links */}
        <DropdownMenuGroup>
          {profileLinks.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.href}
                // asChild
                className="cursor-pointer rounded-lg
                  px-3 py-2.5 focus:bg-amber-50
                  focus:text-[#B77900]"
              >
                <Link href={item.href}>
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Logout */}
        <DropdownMenuItem
          onSelect={() => onLogout?.()}
          className="cursor-pointer rounded-lg
            px-3 py-2.5 text-red-600
            focus:bg-red-50 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

"use client";

import Link from "next/link";
import { ChevronDown, UserRound, BookOpen } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserAvatar } from "@/components/common/user-avatar";
import { SignOutButton } from "../auth/sign-out-button";

interface NavbarUserMenuProps {
  name?: string;
  role?: string;
  avatar?: string | null;
  onLogout?: () => void;
}

const profileLinks = [
  {
    label: "My Profile",
    href: "/student/profile",
    icon: UserRound,
  },
  {
    label: "My Courses",
    href: "/student/enrollments",
    icon: BookOpen,
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
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label="Open student profile menu"
            className="flex shrink-0 items-center gap-3 rounded-full p-1.5 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A800]"
          >
            <UserAvatar
              name={name}
              image={avatar}
              className="size-12 bg-amber-50 sm:size-14"
            />

            <div className="hidden flex-col items-start sm:flex">
              <span className="max-w-32 truncate text-base font-semibold text-[#171717]">
                {name}
              </span>

              <span className="text-sm text-gray-500">{role}</span>
            </div>

            <ChevronDown size={18} className="hidden text-gray-500 sm:block" />
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={12}
        className="w-64 rounded-xl border border-gray-100 bg-white p-2 shadow-xl"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex flex-col gap-1">
              <span className="truncate text-sm font-semibold text-gray-900">
                {name}
              </span>

              <span className="text-xs font-normal text-gray-500">{role}</span>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {profileLinks.map((item) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.href}
                className="cursor-pointer rounded-lg px-3 py-2.5 focus:bg-amber-50 focus:text-[#B77900]"
              >
                <Link href={item.href} className="flex w-full items-center">
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(e) => e.preventDefault()}
          className="flex cursor-pointer items-center rounded-lg px-3 py-2.5 text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

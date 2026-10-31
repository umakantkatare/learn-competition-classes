"use client";

import Link from "next/link";
import { ChevronDown } from "lucide-react";

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

import { profileLinks } from "@/data/profile-links";
import {
  DEFAULT_USER_ROLE,
  USER_ROLES,
  type UserRole,
} from "@/lib/permissions";

interface NavbarUserMenuProps {
  name?: string | null;
  role?: string;
  avatar?: string | null;
}

function isUserRole(role: string): role is UserRole {
  return (USER_ROLES as readonly string[]).includes(role);
}

export default function NavbarUserMenu({
  name,
  role = DEFAULT_USER_ROLE,
  avatar,
}: NavbarUserMenuProps) {
  const validRole = isUserRole(role) ? role : DEFAULT_USER_ROLE;

  const displayName = name?.trim() || "User";

  const displayRole = validRole.charAt(0).toUpperCase() + validRole.slice(1);

  const links = profileLinks[validRole];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Open ${displayName}'s account menu`}
            className="flex shrink-0 items-center gap-3 rounded-full p-1.5 transition-colors hover:bg-amber-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F5A800] focus-visible:ring-offset-2"
          >
            <UserAvatar
              name={displayName}
              image={avatar}
              className="size-10 bg-amber-50 sm:size-11"
            />

            <div className="hidden min-w-0 flex-col items-start sm:flex">
              <span className="max-w-32 truncate text-sm font-semibold text-[#171717]">
                {displayName}
              </span>

              <span className="text-xs text-gray-500">{displayRole}</span>
            </div>

            <ChevronDown
              size={16}
              aria-hidden="true"
              className="hidden shrink-0 text-gray-500 sm:block"
            />
          </button>
        }
      />

      <DropdownMenuContent
        align="end"
        sideOffset={8}
        className="w-64 rounded-xl border border-gray-200 bg-white p-2 shadow-lg"
      >
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                name={displayName}
                image={avatar}
                className="size-10 shrink-0 bg-amber-50"
              />

              <div className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-semibold text-gray-900">
                  {displayName}
                </span>

                <span className="text-xs text-gray-500">{displayRole}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {links.map(({ label, href, icon: Icon }) => (
            <DropdownMenuItem
              key={href}
              render={
                <Link
                  href={href}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-sm outline-none"
                >
                  <Icon size={16} aria-hidden="true" className="shrink-0" />

                  <span>{label}</span>
                </Link>
              }
            />
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          className="cursor-pointer rounded-lg p-0 text-red-600 focus:bg-red-50 focus:text-red-600"
        >
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

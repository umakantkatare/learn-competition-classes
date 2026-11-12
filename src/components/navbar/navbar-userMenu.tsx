
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";

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
  const pathname = usePathname();

  const validRole = isUserRole(role) ? role : DEFAULT_USER_ROLE;

  const displayName = name?.trim() || "User";

  const displayRole =
    validRole.charAt(0).toUpperCase() + validRole.slice(1);

  const links = profileLinks[validRole];

  const isActiveRoute = (href: string) => {
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <DropdownMenu>
      {/* User Trigger */}
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`Open ${displayName}'s account menu`}
            className="
              group flex shrink-0 items-center
              gap-2 sm:gap-3 rounded-full
              p-1.5
              transition-colors duration-200
              hover:bg-accent
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-ring
              focus-visible:ring-offset-2
            "
          >
            <UserAvatar
              name={displayName}
              image={avatar}
              className="
                size-9 shrink-0
                border border-border
                bg-accent
                sm:size-10
              "
            />

            <div className="hidden min-w-0 flex-col items-start sm:flex">
              <span className="
                max-w-32 truncate
                text-sm font-semibold
                text-foreground
              ">
                {displayName}
              </span>

              <span className="
                text-xs font-medium
                text-muted-foreground
              ">
                {displayRole}
              </span>
            </div>

            <ChevronDown
              size={16}
              aria-hidden="true"
              className="
                hidden shrink-0
                text-muted-foreground
                transition-transform duration-200
                group-data-[state=open]:rotate-180
                sm:block
              "
            />
          </button>
        }
      />

      {/* Dropdown Content */}
      <DropdownMenuContent
        align="end"
        sideOffset={10}
        className="
          w-[min(17rem,calc(100vw-1.5rem))]
          rounded-xl border border-border
          bg-popover p-2
          text-popover-foreground
          shadow-xl shadow-black/10
        "
      >
        {/* User Information */}
        <DropdownMenuGroup>
          <DropdownMenuLabel className="px-3 py-3 font-normal">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                name={displayName}
                image={avatar}
                className="
                  size-11 shrink-0
                  border border-border
                  bg-accent
                "
              />

              <div className="flex min-w-0 flex-col gap-1">
                <span className="
                  truncate text-sm
                  font-semibold text-foreground
                ">
                  {displayName}
                </span>

                <span className="
                  w-fit rounded-full
                  bg-accent px-2 py-0.5
                  text-[10px] font-semibold
                  text-accent-foreground
                ">
                  {displayRole}
                </span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Profile Navigation */}
        <DropdownMenuGroup>
          {links.map(({ label, href, icon: Icon }) => {
            const isActive = isActiveRoute(href);

            return (
              <DropdownMenuItem
                key={href}
                render={
                  <Link
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={`
                      flex w-full items-center
                      justify-between gap-3
                      rounded-lg px-3 py-2.5
                      text-sm font-medium
                      outline-none
                      transition-colors duration-200

                      ${
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon
                        size={17}
                        strokeWidth={1.8}
                        aria-hidden="true"
                        className={
                          isActive
                            ? "text-brand-primary"
                            : "text-muted-foreground"
                        }
                      />

                      <span className="truncate">{label}</span>
                    </span>

                    <ChevronRight
                      size={15}
                      aria-hidden="true"
                      className="
                        shrink-0 text-muted-foreground
                        transition-transform duration-200
                        group-hover:translate-x-0.5
                      "
                    />
                  </Link>
                }
              />
            );
          })}
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-border" />

        {/* Logout */}
        <DropdownMenuItem
          onSelect={(event) => event.preventDefault()}
          className="
            cursor-pointer rounded-lg p-0
            text-destructive
            focus:bg-destructive/10
            focus:text-destructive
          "
        >
          <SignOutButton />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

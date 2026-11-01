"use client";

import { Bell, ChevronDown, Menu, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";

import type { UserRole } from "@/lib/permissions";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { SignOutButton } from "../auth/sign-out-button";
import { UserAvatar } from "../common/user-avatar";

type DashboardHeaderProps = {
  title: string;
  role: UserRole;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  onMenuClick?: () => void;
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  teacher: "Teacher",
  student: "Student",
};

export function DashboardHeader({
  title,
  role,
  userName,
  userEmail,
  userImage,
  onMenuClick,
}: DashboardHeaderProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white/95 px-3 backdrop-blur-md transition-colors duration-200 sm:px-6 lg:px-8">
      {/* Left: Mobile Menu + Page Title */}
      <div className="flex min-w-0 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="shrink-0 text-text-secondary hover:bg-muted hover:text-foreground lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h1>

          <p className="hidden text-xs text-text-secondary sm:block">
            LCC <span className="mx-1 text-border">/</span> {roleLabels[role]}
          </p>
        </div>
      </div>

      {/* Right: Notifications + User Menu */}
      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        {/* Notifications */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-text-secondary transition-colors hover:bg-brand-primary/10 hover:text-foreground"
        >
          <Bell className="size-5" />

          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-primary ring-2 ring-background" />
        </Button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                aria-label="Open user menu"
                className="h-auto max-w-full gap-2 rounded-button px-2 py-1.5 transition-colors hover:bg-muted data-[state=open]:bg-muted"
              />
            }
          >
            <UserAvatar
              name={userName}
              image={userImage}
              className="size-9 shrink-0 ring-2 ring-brand-primary/20"
            />

            <span className="hidden min-w-0 max-w-36 text-left sm:block">
              <span className="block truncate text-sm font-medium text-foreground">
                {userName}
              </span>

              <span className="block truncate text-xs text-text-secondary">
                {roleLabels[role]}
              </span>
            </span>

            <ChevronDown className="hidden size-4 shrink-0 text-text-secondary sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            sideOffset={8}
            className="w-64 border-border bg-popover text-popover-foreground shadow-lg"
          >
            <DropdownMenuGroup>
              <DropdownMenuLabel className="p-3 font-normal">
                <div className="flex items-center gap-3">
                  <UserAvatar
                    name={userName}
                    image={userImage}
                    className="size-10 shrink-0"
                  />

                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {userName}
                    </p>

                    <p className="truncate text-xs text-text-secondary">
                      {userEmail}
                    </p>

                    <span className="inline-flex rounded-pill border border-brand-primary/30 bg-brand-primary/10 px-2 py-0.5 text-xs font-medium text-foreground">
                      {roleLabels[role]}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator className="bg-border" />

              <DropdownMenuItem
                onSelect={() => router.push(`/${role}/profile`)}
                className="cursor-pointer gap-2 focus:bg-brand-primary/10 focus:text-foreground"
              >
                <UserRound className="size-4 text-brand-dark dark:text-emerald-300" />
                My Profile
              </DropdownMenuItem>
            </DropdownMenuGroup>

            <DropdownMenuSeparator className="bg-border" />

            <DropdownMenuItem
              onSelect={(event) => event.preventDefault()}
              className="cursor-default p-1 focus:bg-transparent"
            >
              <SignOutButton variant="menu" />
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

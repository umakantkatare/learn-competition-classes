"use client";

import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Settings,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import type { UserRole } from "@/lib/permissions";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  const initials =
    userName
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "U";

  async function handleSignOut() {
    const { error } = await authClient.signOut();

    if (error) {
      return;
    }

    router.replace("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-border bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Open navigation menu"
          onClick={onMenuClick}
          className="shrink-0 lg:hidden"
        >
          <Menu className="size-5" />
        </Button>

        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold text-text-primary sm:text-lg">
            {title}
          </h1>
          <p className="hidden text-xs text-text-secondary sm:block">
            LCC / {roleLabels[role]}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="relative text-text-secondary"
        >
          <Bell className="size-5" />
          <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-primary ring-2 ring-white" />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                type="button"
                variant="ghost"
                className="h-auto gap-2 rounded-button px-2 py-1.5 hover:bg-background"
                aria-label="Open user menu"
              />
            }
          >
            <Avatar className="size-9">
              <AvatarImage src={userImage ?? undefined} alt={userName} />
              <AvatarFallback className="bg-accent text-sm font-semibold text-text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>

            <span className="hidden max-w-36 text-left sm:block">
              <span className="block truncate text-sm font-medium text-text-primary">
                {userName}
              </span>
              <span className="block text-xs text-text-secondary">
                {roleLabels[role]}
              </span>
            </span>

            <ChevronDown className="hidden size-4 text-text-secondary sm:block" />
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="truncate text-xs text-muted-foreground">
                {userEmail}
              </p>
            </DropdownMenuLabel>

            <DropdownMenuSeparator />

            <DropdownMenuItem onSelect={() => router.push(`/${role}/profile`)}>
              <UserRound className="mr-2 size-4" />
              My Profile
            </DropdownMenuItem>

            <DropdownMenuItem onSelect={() => router.push(`/${role}/settings`)}>
              <Settings className="mr-2 size-4" />
              Settings
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem
              onSelect={handleSignOut}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

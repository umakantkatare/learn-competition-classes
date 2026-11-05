"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  GraduationCap,
  BookOpen,
  Video,
  ClipboardList,
  Settings,
  UserRound,
  BarChart3,
  X,
  Tags,
} from "lucide-react";

import type { UserRole } from "@/lib/permissions";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import Logo from "../common/logo";
import { SignOutButton } from "../auth/sign-out-button";

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type DashboardSidebarProps = {
  role: UserRole;
  mobileOpen?: boolean;
  onClose?: () => void;
};

// Static navigation configuration
const navigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "My Profile", href: "/admin", icon: UserRound },
    { label: "Managers", href: "/admin/managers", icon: Users },
    { label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
    { label: "Exam-Category", href: "/admin/exam-categories", icon: Tags },
    { label: "Exams", href: "/admin/exams", icon: GraduationCap },
    { label: "Students", href: "/admin/students", icon: UserRound },
    { label: "Courses & Batches", href: "/admin/batches", icon: BookOpen },
    { label: "Live Classes", href: "/admin/live-classes", icon: Video },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],

  manager: [
    { label: "My Profile", href: "/manager", icon: UserRound },
    { label: "Teachers", href: "/manager/teachers", icon: GraduationCap },
    { label: "Exam-Category", href: "/manager/exam-categories", icon: Tags },
    { label: "Exams", href: "/manager/exams", icon: GraduationCap },
    { label: "Batches", href: "/manager/batches", icon: BookOpen },
    { label: "Live Classes", href: "/manager/live-classes", icon: Video },
    { label: "Enrollments", href: "/manager/enrollments", icon: ClipboardList },
  ],

  teacher: [
    { label: "My Profile", href: "/teacher", icon: UserRound },
    { label: "My Batches", href: "/teacher/batches", icon: BookOpen },
    { label: "Live Classes", href: "/teacher/live-classes", icon: Video },
    { label: "Students", href: "/teacher/students", icon: Users },
  ],

  student: [
    { label: "My Profile", href: "/student", icon: UserRound },
    { label: "My Courses", href: "/student/courses", icon: BookOpen },
    { label: "Live Classes", href: "/student/live-classes", icon: Video },
    { label: "My Tests", href: "/student/tests", icon: ClipboardList },
    { label: "My Results", href: "/student/results", icon: BarChart3 },
  ],
};

const roleLabels: Record<UserRole, string> = {
  admin: "Administrator",
  manager: "Manager",
  teacher: "Teacher",
  student: "Student",
};

export function DashboardSidebar({
  role,
  mobileOpen = false,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Select navigation using the server-provided role prop.
  const items = navigation[role];

  // Determine active navigation item.
  const isActive = (href: string) => {
    if (href === `/${role}`) {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:z-20 lg:h-screen lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Branding */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-5">
          <div className="flex min-w-0 items-center gap-3">
            <Logo width={40} height={40} showName={false} />

            <div className="min-w-0">
              <p className="text-base font-bold leading-tight text-text-primary">
                LCC Institute
              </p>

              <p className="text-xs text-text-secondary">{roleLabels[role]}</p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Close sidebar"
            onClick={onClose}
            className="shrink-0 lg:hidden"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          aria-label={`${roleLabels[role]} navigation`}
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          {items.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-10 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-accent text-text-primary"
                    : "text-text-secondary hover:bg-background hover:text-text-primary",
                )}
              >
                <Icon
                  className={cn(
                    "size-5 shrink-0",
                    active ? "text-brand-dark" : "text-text-secondary",
                  )}
                />

                <span>{item.label}</span>

                {active && (
                  <span className="ml-auto h-5 w-1 rounded-full bg-brand-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="mt-auto shrink-0 border-t border-border p-4">
          <SignOutButton variant="menu" />
        </div>
      </aside>
    </>
  );
}

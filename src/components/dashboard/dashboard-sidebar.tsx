"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
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

const navigation: Record<UserRole, NavItem[]> = {
  admin: [
    { label: "My Profile", href: "/admin", icon: UserRound },
    { label: "Managers", href: "/admin/managers", icon: Users },
    { label: "Exam-Category", href: "/admin/exam-categories", icon: Tags },
    { label: "Exams", href: "/admin/exams", icon: GraduationCap },
    { label: "Teachers", href: "/admin/teachers", icon: GraduationCap },
    { label: "Students", href: "/admin/students", icon: UserRound },
    { label: "Courses & Batches", href: "/admin/batches", icon: BookOpen },
    { label: "Live Classes", href: "/admin/live-classes", icon: Video },
    { label: "Reports", href: "/admin/reports", icon: BarChart3 },
    { label: "Settings", href: "/admin/settings", icon: Settings },
  ],

  manager: [
    { label: "My Profile", href: "/manager", icon: UserRound },
    { label: "Teachers", href: "/manager/teachers", icon: GraduationCap },
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
  const items = navigation[role];

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
          <Link
            href={`/${role}`}
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex size-10 items-center justify-center rounded-lg text-white">
              <Logo width={40} height={40} showName={false} />
            </div>
            <div>
              <p className="text-base font-bold leading-tight text-text-primary">
                LCC Institute
              </p>
              <p className="text-xs text-text-secondary">{roleLabels[role]}</p>
            </div>
          </Link>

          <Button
            type="button"
            aria-label="Close sidebar"
            onClick={onClose}
            className="rounded-md p-2 text-text-secondary hover:bg-accent lg:hidden"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav
          aria-label={`${roleLabels[role]} navigation`}
          className="flex-1 space-y-1 overflow-y-auto p-4"
        >
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-text-secondary">
            Workspace
          </p>

          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== `/${role}` &&
                pathname.startsWith(`${item.href}/`));

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

        {/* Footer */}
        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-background p-3">
            <p className="text-xs font-semibold text-text-primary">
              LCC Institute
            </p>
            <p className="mt-1 text-xs text-text-secondary">
              Learning Competition Classes
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

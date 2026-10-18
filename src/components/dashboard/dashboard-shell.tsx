"use client";

import { useState, type ReactNode } from "react";

import type { UserRole } from "@/lib/permissions";
import { DashboardSidebar } from "./dashboard-sidebar";
import { DashboardHeader } from "./dashboard-header";

type DashboardShellProps = {
  children: ReactNode;
  role: UserRole;
  userName: string;
  userEmail: string;
  userImage?: string | null;
  title?: string;
};

export function DashboardShell({
  children,
  role,
  userName,
  userEmail,
  userImage,
  title = "Overview",
}: DashboardShellProps) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  function closeMobileSidebar() {
    setMobileSidebarOpen(false);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <DashboardSidebar
          role={role}
          mobileOpen={mobileSidebarOpen}
          onClose={closeMobileSidebar}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <DashboardHeader
            title={title}
            role={role}
            userName={userName}
            userEmail={userEmail}
            userImage={userImage}
            onMenuClick={() => setMobileSidebarOpen(true)}
          />

          <main className="w-full flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto w-full max-w-[1280px]">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}

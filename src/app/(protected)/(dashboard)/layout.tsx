import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/authorize";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";

type DashboardLayoutProps = {
  children: ReactNode;
};

export default async function DashboardLayout({
  children,
}: DashboardLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <DashboardShell
      role={user.role}
      userName={user.name}
      userEmail={user.email}
      userImage={user.image}
    >
      {children}
    </DashboardShell>
  );
}

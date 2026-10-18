import { redirect } from "next/navigation";
import { getCurrentUser } from "./authorize";
import type { UserRole } from "@/lib/permissions";

const ROLE_HOME: Record<UserRole, string> = {
  admin: "/admin",
  manager: "/manager",
  teacher: "/teacher",
  student: "/student",
};

export async function requireDashboardRole(role: UserRole) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  if (user.role !== role) {
    redirect(ROLE_HOME[user.role]);
  }

  return user;
}

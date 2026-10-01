import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export const COURSE_MANAGEMENT_ROLES = [
  "MANAGER",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type CourseManagementRole = (typeof COURSE_MANAGEMENT_ROLES)[number];

export async function requireCourseManagementAccess() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role as CourseManagementRole;

  if (!COURSE_MANAGEMENT_ROLES.includes(role)) {
    throw new Error("Forbidden");
  }

  return session;
}

import { auth } from "@/lib/auth";

const ACADEMIC_ROLES = ["manager", "admin", "super_admin"] as const;

export async function requireAcademicAccess() {
  const session = await auth.api.getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role;

  if (!ACADEMIC_ROLES.includes(role as (typeof ACADEMIC_ROLES)[number])) {
    throw new Error("Forbidden");
  }

  return session;
}



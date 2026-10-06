import { auth } from "@/lib/auth";

const ACADEMIC_WRITE_ROLES = ["manager", "admin", "super_admin"] as const;

export async function requireAcademicWriteAccess() {
  const session = await auth.api.getSession();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const role = session.user.role;

  if (
    !ACADEMIC_WRITE_ROLES.includes(
      role as (typeof ACADEMIC_WRITE_ROLES)[number],
    )
  ) {
    throw new Error("Forbidden");
  }

  return session;
}

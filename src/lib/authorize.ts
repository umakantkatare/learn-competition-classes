import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import type { UserRole } from "@/lib/permissions";

type AuthUser = typeof auth.$Infer.Session.user;

type AuthorizedUser = AuthUser & {
  role: UserRole;
};

type RequireRoleOptions = {
  roles: readonly UserRole[];
};

export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    return null;
  }

  const role = session.user.role;

  if (
    role !== "student" &&
    role !== "teacher" &&
    role !== "manager" &&
    role !== "admin"
  ) {
    return null;
  }

  return {
    ...session.user,
    role,
  };
}

export async function requireRole({
  roles,
}: RequireRoleOptions): Promise<AuthorizedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  if (!roles.includes(user.role)) {
    throw new Error("Forbidden");
  }

  return user;
}

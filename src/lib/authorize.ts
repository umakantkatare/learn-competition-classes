import { headers } from "next/headers";
import { unauthorized, forbidden } from "next/navigation";

import { auth } from "@/lib/auth";
import { ROLES, USER_ROLES, type UserRole } from "@/lib/permissions";

type AuthUser = typeof auth.$Infer.Session.user;

export type AuthorizedUser = AuthUser & {
  role: UserRole;
};

type RequireRoleOptions = {
  roles: readonly UserRole[];
};

export type AuthorizationResult =
  | {
      authorized: false;
      status: 401;
      error: "Unauthorized";
      message: string;
    }
  | {
      authorized: false;
      status: 403;
      error: "Forbidden";
      message: string;
    }
  | {
      authorized: true;
      status: 200;
      error: null;
      message: "Authorization successful";
      user: AuthorizedUser;
    };

export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";

    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// Session

export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

// Role Validation

function isValidRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    USER_ROLES.some((validRole) => validRole === role)
  );
}

// Current User

export async function getCurrentUser(): Promise<AuthorizedUser | null> {
  const session = await getSession();

  if (!session?.user || !isValidRole(session.user.role)) {
    return null;
  }

  return {
    ...session.user,
    role: session.user.role,
  };
}

// Require Authentication

export async function requireAuth(): Promise<AuthorizedUser> {
  const user = await getCurrentUser();

  if (!user) {
    unauthorized();
  }

  return user;
}

// Require Role

export async function requireRole({
  roles,
}: RequireRoleOptions): Promise<AuthorizedUser> {
  const user = await requireAuth();

  if (!roles.includes(user.role)) {
    forbidden();
  }

  return user;
}

// Require Admin

export async function requireAdmin(): Promise<AuthorizedUser> {
  return requireRole({
    roles: [ROLES.ADMIN],
  });
}

// Require Admin or Manager

export async function requireAdminOrManager(): Promise<AuthorizationResult> {
  const user = await getCurrentUser();

  if (!user) {
    return {
      authorized: false,
      status: 401,
      error: "Unauthorized",
      message: "Authentication is required. Please log in.",
    };
  }

  if (
    user.role !== ROLES.ADMIN &&
    user.role !== ROLES.MANAGER
  ) {
    return {
      authorized: false,
      status: 403,
      error: "Forbidden",
      message: "Only admins and managers can access this resource.",
    };
  }

  return {
    authorized: true,
    status: 200,
    error: null,
    message: "Authorization successful",
    user,
  };
}

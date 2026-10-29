import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { USER_ROLES, type UserRole } from "@/lib/permissions";

type AuthUser = typeof auth.$Infer.Session.user;

type AuthorizedUser = AuthUser & {
  role: UserRole;
};

type RequireRoleOptions = {
  roles: readonly UserRole[];
};

type AuthorizationResult =
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
    };

// Custom authorization error
export class AuthorizationError extends Error {
  constructor(
    public readonly status: 401 | 403,
    public readonly code: "UNAUTHORIZED" | "FORBIDDEN",
    message: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }
}

// Fetch the current session
export async function getSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}

// Validate user role
function isValidRole(role: unknown): role is UserRole {
  return (
    typeof role === "string" &&
    USER_ROLES.some((validRole) => validRole === role)
  );
}

// Get the authenticated user
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

// Require one or more specific roles
export async function requireRole({
  roles,
}: RequireRoleOptions): Promise<AuthorizedUser> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError(
      401,
      "UNAUTHORIZED",
      "Authentication is required. Please log in.",
    );
  }

  if (!roles.includes(user.role)) {
    throw new AuthorizationError(
      403,
      "FORBIDDEN",
      "You do not have permission to access this resource.",
    );
  }

  return user;
}

// Check whether the current user is an admin
export async function requireAdmin(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthorizationError(
      401,
      "UNAUTHORIZED",
      "Authentication is required. Please log in.",
    );
  }

  if (user.role !== "admin") {
    throw new AuthorizationError(
      403,
      "FORBIDDEN",
      "Admin access is required to perform this action.",
    );
  }

  return true;
}

// Require admin or manager
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

  if (user.role !== "admin" && user.role !== "manager") {
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
  };
}

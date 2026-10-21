import { createAccessControl } from "better-auth/plugins/access";
import { adminAc, defaultStatements } from "better-auth/plugins/admin/access";

export const USER_ROLES = ["student", "teacher", "manager", "admin"] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const DEFAULT_USER_ROLE: UserRole = "student";

const statement = {
  ...defaultStatements,
  teacherProfile: ["create", "read", "update", "delete"],
  batch: ["create", "read", "update", "delete"],
  liveClass: ["create", "read", "update", "delete"],
  enrollment: ["create", "read", "update"],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  ...adminAc.statements,
  teacherProfile: ["create", "read", "update", "delete"],
  batch: ["create", "read", "update", "delete"],
  liveClass: ["create", "read", "update", "delete"],
  enrollment: ["create", "read", "update"],
});

export const managerRole = ac.newRole({
  teacherProfile: ["create", "read", "update"],
  batch: ["create", "read", "update", "delete"],
  liveClass: ["read"],
  enrollment: ["create", "read", "update"],
});

export const teacherRole = ac.newRole({
  teacherProfile: ["read"],
  batch: ["read"],
  liveClass: ["create", "read", "update"],
  enrollment: ["read"],
});

export const studentRole = ac.newRole({
  batch: ["read"],
  liveClass: ["read"],
  enrollment: ["read"],
});

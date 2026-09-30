export const USER_ROLES = {
  STUDENT: "STUDENT",
  TEACHER: "TEACHER",
  MANAGER: "MANAGER",
  ADMIN: "ADMIN",
} as const;

export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

export const PERMISSIONS = {
  COURSE_VIEW: "course:view",
  COURSE_CREATE: "course:create",
  COURSE_UPDATE: "course:update",

  BATCH_VIEW: "batch:view",
  BATCH_CREATE: "batch:create",
  BATCH_UPDATE: "batch:update",

  STUDENT_VIEW: "student:view",
  STUDENT_MANAGE: "student:manage",

  TEST_VIEW: "test:view",
  TEST_CREATE: "test:create",
  TEST_ATTEMPT: "test:attempt",
  TEST_RESULT_VIEW: "test-result:view",

  USER_MANAGE: "user:manage",
  SYSTEM_MANAGE: "system:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];



export const ROLE_PERMISSIONS: Record<
  UserRole,
  readonly Permission[]
> = {
  STUDENT: [
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.TEST_VIEW,
    PERMISSIONS.TEST_ATTEMPT,
    PERMISSIONS.TEST_RESULT_VIEW,
  ],

  TEACHER: [
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.TEST_VIEW,
    PERMISSIONS.TEST_CREATE,
    PERMISSIONS.TEST_RESULT_VIEW,
  ],

  MANAGER: [
    PERMISSIONS.COURSE_VIEW,
    PERMISSIONS.COURSE_CREATE,
    PERMISSIONS.COURSE_UPDATE,
    PERMISSIONS.BATCH_VIEW,
    PERMISSIONS.BATCH_CREATE,
    PERMISSIONS.BATCH_UPDATE,
    PERMISSIONS.STUDENT_VIEW,
    PERMISSIONS.STUDENT_MANAGE,
    PERMISSIONS.TEST_VIEW,
    PERMISSIONS.TEST_RESULT_VIEW,
  ],

  ADMIN: Object.values(PERMISSIONS),

};
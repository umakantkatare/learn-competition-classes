import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  phoneNumberClient,
  adminClient,
  emailOTPClient,
} from "better-auth/client/plugins";

import { auth } from "./auth";
import {
  ac,
  adminRole,
  managerRole,
  teacherRole,
  studentRole,
} from "./permissions";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL,
  plugins: [
    inferAdditionalFields<typeof auth>(),

    adminClient({
      ac,
      roles: {
        admin: adminRole,
        manager: managerRole,
        teacher: teacherRole,
        student: studentRole,
      },
    }),

    emailOTPClient(),
    phoneNumberClient(),
  ],
});

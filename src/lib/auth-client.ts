import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  phoneNumberClient,
  adminClient,
  emailOTPClient,
  jwtClient,
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
    jwtClient(),
  ],
});

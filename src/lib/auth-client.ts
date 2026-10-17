import { createAuthClient } from "better-auth/react";
import {
  inferAdditionalFields,
  phoneNumberClient,
  adminClient,
  emailOTPClient,
  jwtClient,
} from "better-auth/client/plugins";

import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    inferAdditionalFields<typeof auth>(),
    adminClient(),
    emailOTPClient(),
    phoneNumberClient(),
    jwtClient(),
  ],
});

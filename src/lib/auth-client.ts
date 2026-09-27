import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields, phoneNumberClient } from "better-auth/client/plugins";
import { emailOTPClient } from "better-auth/client/plugins";
import { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [inferAdditionalFields<typeof auth>(), emailOTPClient(),  phoneNumberClient() ],
});

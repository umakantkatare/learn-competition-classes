import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP, jwt } from "better-auth/plugins";
import * as schema from "@/db/schema/auth-schema";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth-schema";

import {
  DEFAULT_USER_ROLE,
  ac,
  adminRole,
  managerRole,
  teacherRole,
  studentRole,
} from "./permissions";
import { sendPasswordResetEmail } from "@/helper/sendPasswordResetEmail";

export const auth = betterAuth({
  appName: process.env.NEXT_PUBLIC_APP_NAME!,

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  advanced: {
    database: {
      joins: true,
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    requireEmailVerification: true,

    revokeSessionsOnPasswordReset: true,

    resetPasswordTokenExpiresIn: 900,

    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl: url,
      });
    },

    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      role: DEFAULT_USER_ROLE,
      banned: false,
      banReason: null,
      banExpires: null,
      ...additionalFields,
      id,
    }),
  },

  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
        trim: true,
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      prompt: "select_account",
    },
  },
  plugins: [
    admin({
      ac,
      roles: {
        admin: adminRole,
        manager: managerRole,
        teacher: teacherRole,
        student: studentRole,
      },
      defaultRole: DEFAULT_USER_ROLE,
    }),
    jwt(),

    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      resendStrategy: "reuse",

      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") {
          return;
        }

        const existingUser = await db
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(eq(user.email, email))
          .limit(1);

        const userName = existingUser[0]?.name ?? "Student";

        await sendVerificationEmail({
          to: email,
          verificationCode: otp,
          userName,
        });
      },

      otpLength: 6,
      expiresIn: 300,
    }),

    nextCookies(),
  ],
});

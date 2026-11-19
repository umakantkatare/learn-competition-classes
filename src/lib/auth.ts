import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { admin, emailOTP } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import * as schema from "@/db/schema/auth-schema";

import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { sendPasswordResetEmail } from "@/helper/sendPasswordResetEmail";

import {
  DEFAULT_USER_ROLE,
  ac,
  adminRole,
  managerRole,
  teacherRole,
  studentRole,
} from "./permissions";

function requireEnv(name: string): string {
  const value = process.env[name];

  if (!value?.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

const env = {
  APP_NAME: process.env.APP_NAME ?? "Learn Competition Classes",
  BETTER_AUTH_URL: requireEnv("BETTER_AUTH_URL"),
  BETTER_AUTH_SECRET: requireEnv("BETTER_AUTH_SECRET"),
  APP_URL: requireEnv("NEXT_PUBLIC_APP_URL"),
  GOOGLE_CLIENT_ID: requireEnv("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: requireEnv("GOOGLE_CLIENT_SECRET"),
};

const MINUTE = 60;
const DAY = 24 * 60 * MINUTE;

const AUTH_CONFIG = {
  session: {
    expiresIn: 7 * DAY,
    updateAge: DAY,
    cookieCacheMaxAge: 5 * MINUTE,
  },

  password: {
    minLength: 6,
    maxLength: 128,
    resetTokenExpiresIn: 10 * MINUTE,
  },

  otp: {
    length: 6,
    expiresIn: 10 * MINUTE,
    allowedAttempts: 3,
    rateLimitWindow: MINUTE,
    maxSendAttempts: 3,
    maxVerifyAttempts: 5,
  },
} as const;

export const auth = betterAuth({
  appName: env.APP_NAME,
  baseURL: env.BETTER_AUTH_URL,
  secret: env.BETTER_AUTH_SECRET,

  trustedOrigins: [env.APP_URL],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),

  session: {
    expiresIn: AUTH_CONFIG.session.expiresIn,
    updateAge: AUTH_CONFIG.session.updateAge,

    cookieCache: {
      enabled: true,
      maxAge: AUTH_CONFIG.session.cookieCacheMaxAge,
    },
  },

  rateLimit: {
    enabled: true,
    storage: "database",

    customRules: {
      "/email-otp/send-verification-otp": {
        window: AUTH_CONFIG.otp.rateLimitWindow,
        max: AUTH_CONFIG.otp.maxSendAttempts,
      },

      "/email-otp/verify-email": {
        window: AUTH_CONFIG.otp.rateLimitWindow,
        max: AUTH_CONFIG.otp.maxVerifyAttempts,
      },
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: false,

    minPasswordLength: AUTH_CONFIG.password.minLength,
    maxPasswordLength: AUTH_CONFIG.password.maxLength,

    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,

    resetPasswordTokenExpiresIn: AUTH_CONFIG.password.resetTokenExpiresIn,

    sendResetPassword: async ({ user, url }) => {
      await sendPasswordResetEmail({
        to: user.email,
        userName: user.name,
        resetUrl: url,
      });
    },

    customSyntheticUser: ({ coreFields, additionalFields, id }) => ({
      ...coreFields,
      ...additionalFields,

      id,
      role: DEFAULT_USER_ROLE,
      banned: false,
      banReason: null,
      banExpires: null,
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

      avatarFileId: {
        type: "string",
        required: false,
        input: false,
      },
    },

    deleteUser: {
      enabled: true,
    },
  },

  socialProviders: {
    google: {
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      prompt: "select_account",
    },
  },

  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },

  plugins: [
    admin({
      ac,
      adminRoles: ["admin"],

      roles: {
        admin: adminRole,
        manager: managerRole,
        teacher: teacherRole,
        student: studentRole,
      },

      defaultRole: DEFAULT_USER_ROLE,
    }),

    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,

      otpLength: AUTH_CONFIG.otp.length,
      expiresIn: AUTH_CONFIG.otp.expiresIn,
      allowedAttempts: AUTH_CONFIG.otp.allowedAttempts,

      storeOTP: "encrypted",
      resendStrategy: "reuse",

      async sendVerificationOTP({ email, otp, type }) {
        if (type !== "email-verification") return;

        const [existingUser] = await db
          .select({
            name: schema.user.name,
          })
          .from(schema.user)
          .where(eq(schema.user.email, email))
          .limit(1);

        await sendVerificationEmail({
          to: email,
          verificationCode: otp,
          userName: existingUser?.name ?? "Student",
        });
      },
    }),

    nextCookies(),
  ],
});

export type Auth = typeof auth;

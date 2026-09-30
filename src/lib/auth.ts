import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import * as schema from "@/db/schema/auth-schema";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth-schema";
import { USER_ROLES } from "./permissions";

console.log("AUTH SCHEMA:", Object.keys(schema));

export const auth = betterAuth({
  appName: "LCC Institute",

  baseURL: process.env.BETTER_AUTH_URL,

  secret: process.env.BETTER_AUTH_SECRET,

  trustedOrigins: [process.env.NEXT_PUBLIC_APP_URL!],

  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  advanced: {
    database: {
      joins: true, // Enable performance optimization
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: USER_ROLES.STUDENT,
        input: false,
      },
      phoneNumber: {
        type: "string",
        required: true,
        unique: true,
        trim: true,
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,
      resendStrategy: "reuse",
      async sendVerificationOTP({ email, otp, type }) {
        console.log("OTP callback triggered");
        console.log("OTP type:", type);
        if (type === "email-verification") {
          const existingUser = await db
            .select({
              id: user.id,
              name: user.name,
              email: user.email,
            })
            .from(user)
            .where(eq(user.email, email))
            .limit(1);

          console.log("User found:", existingUser.length > 0);
          console.log("Username:", existingUser[0]?.name);

          const userName = existingUser[0]?.name ?? "Student";
          await sendVerificationEmail({
            to: email,
            verificationCode: otp,
            userName: userName,
          });
        }
      },
      otpLength: 6,
      expiresIn: 300,
    }),
    nextCookies(),
  ],
});

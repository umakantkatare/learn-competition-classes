import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import * as schema from "@/db/schema/auth-schema";

console.log("AUTH SCHEMA:", Object.keys(schema));

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    minPasswordLength: 6,
    requireEmailVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: ["student", "teacher", "manager", "admin"],
        required: false,
        defaultValue: "student",
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
    nextCookies(),
    emailOTP({
      // Send OTP when user signs up
      sendVerificationOnSignUp: true,
      // Override default link-based verification to use OTP instead
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          await sendEmail({
            to: email,
            subject: "Verify your email",
            body: `Your verification code: ${otp}`,
          });
        }
      },
      otpLength: 6,
      expiresIn: 300, // 5 minutes
    }),
  ],
});

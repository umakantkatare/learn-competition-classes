import { db } from "@/db";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { emailOTP } from "better-auth/plugins";
import * as schema from "@/db/schema/auth-schema";
import { sendVerificationEmail } from "@/helper/sendVerificationEmail";
import { eq } from "drizzle-orm";
import { user } from "@/db/schema/auth-schema";

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
  ],
});

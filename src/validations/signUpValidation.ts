import { z } from "zod";

export const signUpSchema = z
  .object({
    name: z.string().trim().min(2, "Full name must be at least 2 characters."),

    email: z.string().trim().email("Please enter a valid email address."),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number."),

    password: z.string().min(6, "Password must be at least 6 characters."),

    confirmPassword: z.string().min(1, "Please confirm your password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

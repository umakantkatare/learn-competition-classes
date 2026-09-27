import { z } from "zod";

export const verifyEmailSchema = z.object({
  code: z
    .string()
    .length(6, "Please enter all 6 digits of your verification code.")
    .regex(/^\d+$/, "Verification code must contain only numbers."),
});

import { z } from "zod";

const idSchema = z.string().trim().min(1, "Manager ID is required");

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .transform((email) => email.toLowerCase());

const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number.");

const employeeCodeSchema = z
  .string()
  .trim()
  .min(2, "Employee code must be at least 2 characters.")
  .max(50, "Employee code cannot exceed 50 characters.");

export const createManagerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    email: emailSchema,

    phoneNumber: phoneNumberSchema,

    employeeCode: employeeCodeSchema,

    image: z
      .string()
      .trim()
      .url("Please provide a valid profile image URL.")
      .optional()
      .nullable(),

    avatarFileId: z
      .string()
      .trim()
      .min(1, "Invalid avatar file ID.")
      .optional()
      .nullable(),
  })
  .strict();

export const createManagerProfileSchema = createManagerSchema;

export type CreateManagerInfer = z.infer<typeof createManagerSchema>;

export type CreateManagerInput = z.input<typeof createManagerSchema>;

export type CreateManagerOutput = z.output<typeof createManagerSchema>;

// export const createManagerProfileRequestSchema = z
//   .object({
//     userId: idSchema,
//     employeeCode: employeeCodeSchema,
//   })
//   .strict();

// export type CreateManagerProfileRequest = z.infer<
//   typeof createManagerProfileRequestSchema
// >;

// export const createManagerProfileSchema = createManagerProfileRequestSchema;

export type CreateManagerProfileInput = z.input<
  typeof createManagerProfileSchema
>;

export type CreateManagerProfileOutput = z.output<
  typeof createManagerProfileSchema
>;

export const updateManagerProfileSchema = z
  .object({
    employeeCode: employeeCodeSchema.optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update a manager profile.",
  });

export const updateOwnManagerProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must contain at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters.")
      .optional(),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number.")
      .optional(),

    image: z
      .string()
      .trim()
      .url("Please provide a valid profile image URL.")
      .nullable()
      .optional(),

    avatarFileId: z
      .string()
      .trim()
      .min(1, "Invalid avatar file ID.")
      .nullable()
      .optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update your profile.",
  });

export type UpdateOwnManagerProfileInput = z.infer<
  typeof updateOwnManagerProfileSchema
>;

export type UpdateManagerProfileInput = z.input<
  typeof updateManagerProfileSchema
>;

export type UpdateManagerProfileOutput = z.output<
  typeof updateManagerProfileSchema
>;

export const sendManagerEmailOtpSchema = z
  .object({
    email: emailSchema,
  })
  .strict();

export type SendManagerEmailOtpInput = z.infer<
  typeof sendManagerEmailOtpSchema
>;

export const verifyManagerEmailOtpSchema = z
  .object({
    email: emailSchema,
    otp: z
      .string()
      .trim()
      .regex(/^[0-9]{6}$/, "OTP must be exactly 6 digits."),
  })
  .strict();

export type VerifyManagerEmailOtpInput = z.infer<
  typeof verifyManagerEmailOtpSchema
>;

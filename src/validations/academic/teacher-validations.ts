import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Please enter a valid email address.")
  .transform((email) => email.toLowerCase());

const phoneNumberSchema = z
  .string()
  .trim()
  .regex(/^[0-9]{10}$/, "Please enter a valid 10-digit mobile number.");

const subjectSchema = z
  .array(
    z
      .string()
      .trim()
      .min(2, "Subject must contain at least 2 characters.")
      .max(50, "Subject cannot exceed 50 characters."),
  )
  .min(0, "Select at least one subject.")
  .max(10, "You can select a maximum of 10 subjects.")
  .refine(
    (subjects) =>
      new Set(subjects.map((s) => s.toLowerCase())).size === subjects.length,
    "Duplicate subjects are not allowed.",
  );

export const createTeacherSchema = z
  .object({
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

    name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters.")
      .max(100, "Name cannot exceed 100 characters."),

    email: emailSchema,

    phoneNumber: phoneNumberSchema,

    bio: z
      .string()
      .trim()
      .max(2000, "Bio cannot exceed 2000 characters.")
      .optional()
      .nullable(),

    subject: subjectSchema,

    experienceYears: z.coerce
      .number()
      .int()
      .min(0, "Experience cannot be negative.")
      .max(60, "Experience cannot exceed 60 years.")
      .default(1),

    qualification: z
      .string()
      .trim()
      .max(200, "Qualification cannot exceed 200 characters.")
      .optional()
      .nullable(),
  })
  .strict();

export const updateTeacherSchema = createTeacherSchema.partial().strict();

export type CreateTeacherInput = z.input<typeof createTeacherSchema>;

export type CreateTeacherPayload = z.output<typeof createTeacherSchema>;

export type UpdateTeacherInput = z.input<typeof updateTeacherSchema>;

export type UpdateTeacherPayload = z.output<typeof updateTeacherSchema>;

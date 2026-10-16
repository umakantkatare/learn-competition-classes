import { z } from "zod";

export const createTeacherProfileSchema = z.object({
  userId: z.string().trim().min(1, "User is required"),

  bio: z
    .string()
    .trim()
    .max(3000, "Bio must be at most 3000 characters")
    .nullable()
    .optional(),

  qualification: z
    .string()
    .trim()
    .max(500, "Qualification must be at most 500 characters")
    .nullable()
    .optional(),

  experienceYears: z
    .number()
    .int()
    .min(0, "Experience cannot be negative")
    .max(80, "Experience is too high")
    .default(0),

  specializations: z
    .array(z.string().trim().min(1).max(100))
    .max(30, "Maximum 30 specializations allowed")
    .default([]),
});

export const updateTeacherProfileSchema = createTeacherProfileSchema
  .omit({ userId: true })
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateTeacherProfileInput = z.infer<
  typeof createTeacherProfileSchema
>;

export type UpdateTeacherProfileInput = z.infer<
  typeof updateTeacherProfileSchema
>;

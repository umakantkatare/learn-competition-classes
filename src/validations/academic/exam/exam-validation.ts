import { z } from "zod";

export const createExamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Exam name is required")
    .max(100, "Exam name must be 100 characters or less"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug must be 120 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  year: z
    .number()
    .int("Year must be a whole number")
    .min(2000, "Invalid exam year")
    .max(2100, "Invalid exam year"),

  isActive: z.boolean(),
});

export const updateExamSchema = createExamSchema;

export type CreateExamInput = z.infer<typeof createExamSchema>;
export type UpdateExamInput = z.infer<typeof updateExamSchema>;

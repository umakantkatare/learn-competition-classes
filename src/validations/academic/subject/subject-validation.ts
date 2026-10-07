import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Subject name is required")
    .max(100, "Subject name must be 100 characters or less"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug must be 120 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  isActive: z.boolean(),
});

export const updateSubjectSchema = createSubjectSchema;

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;

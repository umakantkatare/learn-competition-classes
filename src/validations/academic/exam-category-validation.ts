import { z } from "zod";

// Slug validation
export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, "Slug must be at least 2 characters")
  .max(120, "Slug must not exceed 120 characters")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain lowercase letters, numbers, and single hyphens only",
  );

// Create Exam Category
export const createExamCategorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name is required")
    .max(100, "Category name cannot exceed 100 characters."),

  slug: slugSchema,

  iconUrl: z.string().url("Invalid icon URL").optional().nullable(),

  isActive: z.boolean().default(true),
});

// Update Exam Category
export const updateExamCategorySchema = createExamCategorySchema.partial();

// Input and output types
export type CreateExamCategoryInput = z.input<typeof createExamCategorySchema>;

export type CreateExamCategoryOutput = z.output<
  typeof createExamCategorySchema
>;

export type UpdateExamCategoryInput = z.input<typeof updateExamCategorySchema>;

export type UpdateExamCategoryOutput = z.output<
  typeof updateExamCategorySchema
>;

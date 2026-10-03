import { z } from "zod";

export const courseCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Course title is required")
    .max(150, "Course title must be less than 150 characters"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(180, "Slug must be less than 180 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug can only contain lowercase letters, numbers and hyphens",
    ),

  description: z
    .string()
    .trim()
    .max(2000, "Description must be less than 2000 characters")
    .optional()
    .or(z.literal("")),

  thumbnail: z
    .string()
    .trim()
    .url("Enter a valid thumbnail URL")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean(),
});

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;
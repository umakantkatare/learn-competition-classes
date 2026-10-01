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
    .min(1, "Course slug is required")
    .max(180, "Course slug must be less than 180 characters")
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
    .url("Invalid thumbnail URL")
    .optional()
    .or(z.literal("")),

  isActive: z.boolean().default(true),
});

export const courseUpdateSchema = courseCreateSchema.partial();

export const courseSectionCreateSchema = z.object({
  courseId: z.string().min(1, "Course ID is required"),

  title: z
    .string()
    .trim()
    .min(1, "Section title is required")
    .max(150, "Section title must be less than 150 characters"),

  description: z
    .string()
    .trim()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .or(z.literal("")),

  order: z
    .number()
    .int("Order must be an integer")
    .min(0, "Order cannot be negative")
    .default(0),

  isActive: z.boolean().default(true),
});

export const courseSectionUpdateSchema = courseSectionCreateSchema
  .omit({
    courseId: true,
  })
  .partial();

export type CourseCreateInput = z.infer<typeof courseCreateSchema>;

export type CourseUpdateInput = z.infer<typeof courseUpdateSchema>;

export type CourseSectionCreateInput = z.infer<
  typeof courseSectionCreateSchema
>;

export type CourseSectionUpdateInput = z.infer<
  typeof courseSectionUpdateSchema
>;

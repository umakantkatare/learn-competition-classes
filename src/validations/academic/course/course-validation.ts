import { z } from "zod";

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug is required")
  .max(120, "Slug must be 120 characters or less")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug must contain only lowercase letters, numbers and hyphens",
  );

const featuresSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Feature cannot be empty")
      .max(200, "Feature must be 200 characters or less"),
  )
  .max(20, "A course can have at most 20 features");

const courseFieldsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Course name is required")
    .max(150, "Course name must be 150 characters or less"),

  slug: slugSchema,

  description: z
    .string()
    .trim()
    .max(5000, "Description must be 5000 characters or less")
    .nullable(),

  thumbnail: z
    .string()
    .trim()
    .url("Thumbnail must be a valid URL")
    .max(2048, "Thumbnail URL is too long")
    .nullable(),

  features: featuresSchema,

  price: z
    .number()
    .int("Price must be a whole number of paise")
    .min(0, "Price cannot be negative"),

  salePrice: z
    .number()
    .int("Sale price must be a whole number of paise")
    .min(0, "Sale price cannot be negative")
    .nullable(),

  isActive: z.boolean(),
});

export const createCourseSchema = courseFieldsSchema.superRefine(
  (data, ctx) => {
    if (data.salePrice !== null && data.salePrice > data.price) {
      ctx.addIssue({
        code: "custom",
        path: ["salePrice"],
        message: "Sale price cannot exceed the regular price",
      });
    }
  },
);

export const updateCourseSchema = createCourseSchema;

export type CreateCourseInput = z.infer<typeof createCourseSchema>;

export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

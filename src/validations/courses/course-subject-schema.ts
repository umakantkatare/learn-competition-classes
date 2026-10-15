import { z } from "zod";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Subject name is required")
  .max(150, "Subject name must be at most 150 characters");

export const teacherIdSchema = z
  .string()
  .trim()
  .transform((value) => (value === "" ? null : value))
  .pipe(z.string().min(1).nullable())
  .optional()

export const createCourseSubjectSchema = z.object({
  courseId: z.string().trim().min(1, "Course is required"),

  teacherId: teacherIdSchema,

  name: nameSchema,

  isPublished: z.boolean(),
});

export const updateCourseSubjectSchema = z
  .object({
    courseId: z.string().trim().min(1).optional(),

    teacherId: teacherIdSchema.optional(),

    name: nameSchema.optional(),

    isPublished: z.boolean().optional(),
  })
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided",
  );

export type CreateCourseSubjectInput = z.infer<
  typeof createCourseSubjectSchema
>;

export type UpdateCourseSubjectInput = z.infer<
  typeof updateCourseSubjectSchema
>;

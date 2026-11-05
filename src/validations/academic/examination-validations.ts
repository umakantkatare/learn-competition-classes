// import { z } from "zod";
// import { slugSchema } from "./exam-category-validation";

// const idSchema = z.string().trim().min(1, "ID is required");

// export const createExaminationSchema = z.object({
//   name: z
//     .string()
//     .trim()
//     .min(2, "Examination name must be at least 2 characters")
//     .max(150, "Examination name cannot exceed 150 characters"),

//   slug: slugSchema,

//   categoryId: idSchema,

//   isActive: z.boolean().default(true),
// });

// export const updateExaminationSchema = createExaminationSchema
//   .partial()
//   .refine(
//     (data) => Object.keys(data).length > 0,
//     "At least one field is required to update an examination.",
//   );

// // Inferred Types
// export type CreateExaminationInput = z.infer<typeof createExaminationSchema>;

// export type UpdateExaminationInput = z.infer<typeof updateExaminationSchema>;

import { z } from "zod";
import { slugSchema } from "./exam-category-validation";

const idSchema = z.string().trim().min(1, "Please select an exam category.");

export const createExaminationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Examination name must be at least 2 characters")
    .max(150, "Examination name cannot exceed 150 characters"),

  slug: slugSchema,

  categoryId: idSchema,

  isActive: z.boolean(),
});

export const updateExaminationSchema = createExaminationSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field is required to update an examination.",
  );

export type CreateExaminationInput = z.input<typeof createExaminationSchema>;

export type UpdateExaminationInput = z.input<typeof updateExaminationSchema>;

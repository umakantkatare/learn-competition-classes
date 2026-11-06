import { z } from "zod";
import { batchMediumEnum, batchStatusEnum } from "@/db/schema/academic-enums";

/* -------------------------------------------------------------------------- */
/* Reusable Schemas                                                           */
/* -------------------------------------------------------------------------- */

export const batchMediumSchema = z.enum(batchMediumEnum.enumValues);

export const batchStatusSchema = z.enum(batchStatusEnum.enumValues);

export const idSchema = z.string().trim().min(1, "ID is required");

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

export const decimalSchema = z
  .union([z.string(), z.number()])
  .refine(
    (value) =>
      String(value).trim() !== "" &&
      Number.isFinite(Number(value)) &&
      Number(value) >= 0,
    {
      message: "Must be a valid non-negative amount",
    },
  )
  .transform((value) => Number(value).toFixed(2));

/* -------------------------------------------------------------------------- */
/* Optional Field Schemas                                                     */
/* -------------------------------------------------------------------------- */

const optionalUrlSchema = z.preprocess((value) => {
  if (value === "") return null;
  return value;
}, z.string().trim().url("Must be a valid URL").nullable().optional());

const requiredDateSchema = z.preprocess(
  (value) => (value === "" || value === null ? undefined : value),
  z.coerce.date({
    error: "A valid date is required",
  }),
);

const optionalDateSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.date().nullable().optional(),
);

const optionalValiditySchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.coerce.number().int().positive().nullable().optional(),
);

/* -------------------------------------------------------------------------- */
/* Base Batch Schema                                                          */
/* -------------------------------------------------------------------------- */

const baseBatchSchema = z.object({
  examinationId: idSchema,

  teacherIds: z
    .array(idSchema)
    .default([])
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate teachers are not allowed",
    ),

  createdBy: idSchema,

  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200, "Title must not exceed 200 characters"),

  slug: slugSchema,

  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),

  thumbnail: optionalUrlSchema,

  previewVideo: optionalUrlSchema,

  originalPrice: decimalSchema,

  discountPrice: decimalSchema,

  isFree: z.boolean().default(false),

  startDate: requiredDateSchema,

  expiryDate: optionalDateSchema,

  validityMonths: optionalValiditySchema,

  medium: batchMediumSchema.default("HINGLISH"),

  status: batchStatusSchema.default("UPCOMING"),

  isPublished: z.boolean().default(false),
});

/* -------------------------------------------------------------------------- */
/* Pricing Validation                                                         */
/* -------------------------------------------------------------------------- */

function validateBatchPricing(data: {
  isFree?: boolean;
  originalPrice?: string;
  discountPrice?: string;
}) {
  const { isFree, originalPrice, discountPrice } = data;

  // Partial update: validate only when both prices are provided.
  if (originalPrice === undefined || discountPrice === undefined) {
    return true;
  }

  const original = Number(originalPrice);
  const discount = Number(discountPrice);

  if (isFree === true) {
    return original === 0 && discount === 0;
  }

  return discount <= original;
}

/* -------------------------------------------------------------------------- */
/* Create Batch Schema                                                        */
/* -------------------------------------------------------------------------- */

export const createBatchSchema = baseBatchSchema
  .omit({
    createdBy: true,
  })
  .superRefine((data, ctx) => {
    if (!validateBatchPricing(data)) {
      ctx.addIssue({
        code: "custom",
        message:
          data.isFree === true
            ? "Free batch must have zero original and discount prices"
            : "Discount price cannot be greater than original price",
        path: ["discountPrice"],
      });
    }

    if (data.expiryDate && data.expiryDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Expiry date must be after the start date",
        path: ["expiryDate"],
      });
    }

    if (
      data.isFree &&
      (Number(data.originalPrice) !== 0 || Number(data.discountPrice) !== 0)
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Free batch pricing must be zero",
        path: ["originalPrice"],
      });
    }
  });

/* -------------------------------------------------------------------------- */
/* Update Batch Schema                                                        */
/* -------------------------------------------------------------------------- */

export const updateBatchSchema = baseBatchSchema
  .omit({
    createdBy: true,
  })
  .partial()
  .superRefine((data, ctx) => {
    if (!validateBatchPricing(data)) {
      ctx.addIssue({
        code: "custom",
        message:
          data.isFree === true
            ? "Free batch must have zero original and discount prices"
            : "Discount price cannot be greater than original price",
        path: ["discountPrice"],
      });
    }

    if (
      data.startDate &&
      data.expiryDate &&
      data.expiryDate <= data.startDate
    ) {
      ctx.addIssue({
        code: "custom",
        message: "Expiry date must be after the start date",
        path: ["expiryDate"],
      });
    }
  });

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export type CreateBatchFormInput = z.input<typeof createBatchSchema>;

// import { z } from "zod";
// import { batchMediumEnum, batchStatusEnum } from "@/db/schema/academic-enums";

// export const batchMediumSchema = z.enum(batchMediumEnum.enumValues);
// export const batchStatusSchema = z.enum(batchStatusEnum.enumValues);
// export const idSchema = z.string().trim().min(1, "ID is required");

// export const slugSchema = z
//   .string()
//   .trim()
//   .toLowerCase()
//   .min(2, "Slug must be at least 2 characters")
//   .max(120, "Slug must not exceed 120 characters")
//   .regex(
//     /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//     "Slug must contain lowercase letters, numbers, and single hyphens only",
//   );

// export const decimalSchema = z
//   .union([z.string(), z.number()])
//   .refine((val) => Number.isFinite(Number(val)) && Number(val) >= 0, {
//     message: "Must be a valid non-negative amount",
//   })
//   .transform((val) => Number(val).toFixed(2));

// const baseBatchSchema = z.object({
//   examinationId: idSchema,

//   teacherIds: z
//     .array(idSchema)
//     .default([])
//     .refine(
//       (ids) => new Set(ids).size === ids.length,
//       "Duplicate teachers are not allowed",
//     ),

//   createdBy: idSchema,

//   title: z
//     .string()
//     .trim()
//     .min(3, "Title must be at least 3 characters")
//     .max(200, "Title must not exceed 200 characters"),

//   slug: slugSchema,

//   description: z
//     .string()
//     .trim()
//     .min(10, "Description must be at least 10 characters"),

//   // features: z
//   //   .array(z.string().trim().min(1, "Feature cannot be empty").max(100))
//   //   .max(30, "Maximum 30 features are allowed")
//   //   .default([])
//   //   .refine(
//   //     (features) =>
//   //       new Set(features.map((feature) => feature.toLowerCase())).size ===
//   //       features.length,
//   //     "Duplicate features are not allowed",
//   //   ),

//   thumbnail: z.string().url("Thumbnail must be a valid URL"),

//   previewVideo: z
//     .string()
//     .url("Preview video must be a valid URL")
//     .optional()
//     .nullable(),

//   originalPrice: decimalSchema,

//   discountPrice: decimalSchema,

//   isFree: z.boolean().default(false),

//   startDate: z.coerce.date(),

//   expiryDate: z.coerce.date().optional().nullable(),

//   validityMonths: z.coerce
//     .number()
//     .int()
//     .positive()
//     .default(12)
//     .optional()
//     .nullable(),

//   medium: batchMediumSchema.default("HINGLISH"),

//   status: batchStatusSchema.default("UPCOMING"),

//   isPublished: z.boolean().default(false),
// });

// const validateBatchPricing = (data: {
//   isFree?: boolean;
//   originalPrice?: string;
//   discountPrice?: string;
// }) => {
//   const originalPrice =
//     data.originalPrice !== undefined ? Number(data.originalPrice) : undefined;

//   const discountPrice =
//     data.discountPrice !== undefined ? Number(data.discountPrice) : undefined;

//   if (data.isFree === true) {
//     return originalPrice === 0 && discountPrice === 0;
//   }

//   if (originalPrice !== undefined && discountPrice !== undefined) {
//     return discountPrice <= originalPrice;
//   }

//   return true;
// };

// export const createBatchSchema = baseBatchSchema
//   .omit({ createdBy: true })
//   .superRefine((data, ctx) => {
//     if (!validateBatchPricing(data)) {
//       ctx.addIssue({
//         code: "custom",
//         message: data.isFree
//           ? "Free batch must have zero original and discount prices"
//           : "Discount price cannot be greater than original price",
//         path: ["discountPrice"],
//       });
//     }

//     if (data.expiryDate && data.expiryDate <= data.startDate) {
//       ctx.addIssue({
//         code: "custom",
//         message: "Expiry date must be after the start date",
//         path: ["expiryDate"],
//       });
//     }
//   });

// export const updateBatchSchema = baseBatchSchema
//   .omit({
//     createdBy: true,
//   })
//   .partial()
//   .superRefine((data, ctx) => {
//     if (!validateBatchPricing(data)) {
//       ctx.addIssue({
//         code: "custom",
//         message:
//           data.isFree === true
//             ? "Free batch must have zero original and discount prices"
//             : "Discount price cannot be greater than original price",
//         path: ["discountPrice"],
//       });
//     }

//     if (
//       data.startDate &&
//       data.expiryDate &&
//       data.expiryDate <= data.startDate
//     ) {
//       ctx.addIssue({
//         code: "custom",
//         message: "Expiry date must be after the start date",
//         path: ["expiryDate"],
//       });
//     }
//   });

// export type CreateBatchInput = z.infer<typeof createBatchSchema>;
// export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

// import { batchMediumEnum, batchStatusEnum } from "@/db/schema/academic-enums";
// import { z } from "zod";

// export const batchMediumSchema = z.enum(batchMediumEnum.enumValues);
// export const batchStatusSchema = z.enum(batchStatusEnum.enumValues);

// export const idSchema = z.string().trim().min(1, "ID is required");

// export const slugSchema = z
//   .string()
//   .trim()
//   .toLowerCase()
//   .min(2, "Slug must be at least 2 characters")
//   .max(120, "Slug must not exceed 120 characters")
//   .regex(
//     /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
//     "Slug must contain lowercase letters, numbers, and single hyphens only",
//   );

// const decimalSchema = z
//   .union([z.string(), z.number()])
//   .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
//     message: "Must be a valid non-negative amount",
//   })
//   .transform((val) => Number(val).toFixed(2));

// const baseBatchSchema = z.object({
//   examinationId: idSchema,
//   createdBy: idSchema,
//   title: z
//     .string()
//     .trim()
//     .min(3, "Title must be at least 3 characters")
//     .max(200),

//   slug: slugSchema,

//   description: z
//     .string()
//     .trim()
//     .min(10, "Description must be at least 10 characters"),

//   thumbnail: z.string().url("Thumbnail must be a valid URL"),

//   previewVideo: z
//     .string()
//     .url("Preview video must be a valid URL")
//     .optional()
//     .nullable(),

//   originalPrice: decimalSchema,
//   discountPrice: decimalSchema,

//   isFree: z.boolean().default(false),

//   teacherIds: z
//     .array(idSchema)
//     .default([])
//     .refine(
//       (ids) => new Set(ids).size === ids.length,
//       "Duplicate teachers are not allowed",
//     ),
//   startDate: z.coerce.date(),
//   expiryDate: z.coerce.date().optional().nullable(),

//   validityMonths: z.coerce
//     .number()
//     .int()
//     .positive()
//     .default(12)
//     .optional()
//     .nullable(),

//   medium: batchMediumSchema.default("HINGLISH"),
//   status: batchStatusSchema.default("UPCOMING"),
//   isPublished: z.boolean().default(false),
// });

// export const createBatchSchema = baseBatchSchema
//   .refine((data) => Number(data.discountPrice) <= Number(data.originalPrice), {
//     message: "Discount price cannot be greater than original price",
//     path: ["discountPrice"],
//   })
//   .refine((data) => !data.expiryDate || data.expiryDate > data.startDate, {
//     message: "Expiry date must be after the start date",
//     path: ["expiryDate"],
//   });

// export const updateBatchSchema = baseBatchSchema
//   .omit({ createdBy: true })
//   .partial()
//   .refine(
//     (data) => {
//       if (
//         data.originalPrice !== undefined &&
//         data.discountPrice !== undefined
//       ) {
//         return Number(data.discountPrice) <= Number(data.originalPrice);
//       }
//       return true;
//     },
//     {
//       message: "Discount price cannot be greater than original price",
//       path: ["discountPrice"],
//     },
//   );

// export type CreateBatchInput = z.infer<typeof createBatchSchema>;
// export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

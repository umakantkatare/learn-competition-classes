import { z } from "zod";
import { batchMediumEnum, batchStatusEnum } from "@/db/schema/academic-enums";

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

// Get current date according to Indian timezone
function getTodayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

// Convert date into YYYY-MM-DD using Indian timezone
function getDateInIndia(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Validate that start date is today or a future date
function isValidStartDate(date: Date): boolean {
  return getDateInIndia(date) >= getTodayInIndia();
}

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

export const batchFeaturesSchema = z
  .array(
    z
      .string()
      .trim()
      .min(1, "Feature cannot be empty")
      .max(150, "Feature must not exceed 150 characters"),
  )
  .default([])
  .refine(
    (features) => new Set(features).size === features.length,
    "Duplicate features are not allowed",
  );

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

  features: batchFeaturesSchema,

  thumbnail: optionalUrlSchema,
  thumbnailFileId: z.string().trim().nullable().optional(),

  previewVideo: optionalUrlSchema,
  previewVideoFileId: z.string().trim().nullable().optional(),

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

function validateBatchPricing(data: {
  isFree?: boolean;
  originalPrice?: string;
  discountPrice?: string;
}) {
  const { isFree, originalPrice, discountPrice } = data;

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

// Exactly one of expiryDate or validityMonths must be provided.
function validateBatchSchedule(data: {
  expiryDate?: Date | null;
  validityMonths?: number | null;
}): boolean {
  const hasExpiryDate =
    data.expiryDate !== undefined && data.expiryDate !== null;

  const hasValidityMonths =
    data.validityMonths !== undefined && data.validityMonths !== null;

  return hasExpiryDate !== hasValidityMonths;
}

export const createBatchSchema = baseBatchSchema
  .omit({
    createdBy: true,
  })
  .superRefine((data, ctx) => {
    // Validate start date
    if (!isValidStartDate(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: "Batch start date cannot be earlier than today's date",
        path: ["startDate"],
      });
    }

    // Validate pricing
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

    // Validate mutually exclusive schedule fields
    if (!validateBatchSchedule(data)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either expiry date or validity months, not both.",
        path: ["expiryDate"],
      });
    }

    // Validate expiry date
    if (data.expiryDate && data.expiryDate <= data.startDate) {
      ctx.addIssue({
        code: "custom",
        message: "Expiry date must be after the start date",
        path: ["expiryDate"],
      });
    }

    // Validate free batch pricing
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

export const updateBatchSchema = baseBatchSchema
  .omit({
    createdBy: true,
  })
  .partial()
  .superRefine((data, ctx) => {
    // Validate start date only when provided
    if (data.startDate && !isValidStartDate(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: "Batch start date cannot be earlier than today's date",
        path: ["startDate"],
      });
    }

    // Validate pricing
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

    // Validate schedule fields only when schedule is updated
    const hasScheduleField =
      data.expiryDate !== undefined || data.validityMonths !== undefined;

    if (hasScheduleField && !validateBatchSchedule(data)) {
      ctx.addIssue({
        code: "custom",
        message: "Provide either expiry date or validity months, not both.",
        path: ["expiryDate"],
      });
    }

    // Validate expiry date when both dates are provided
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

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export type CreateBatchFormInput = z.input<typeof createBatchSchema>;

import { z } from "zod";
import { batchMediumEnum, batchStatusEnum } from "@/db/schema/academic-enums";

// ============================================
// ENUM & COMMON SCHEMAS
// ============================================

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

// ============================================
// DATE HELPERS
// ============================================

function getTodayInIndia(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function getDateInIndia(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

// Create mode: today or future date only.
function isValidStartDate(date: Date): boolean {
  return getDateInIndia(date) >= getTodayInIndia();
}

// ============================================
// OPTIONAL FIELD SCHEMAS
// ============================================

const optionalUrlSchema = z.preprocess(
  (value) => (value === "" ? null : value),
  z.string().trim().url("Must be a valid URL").nullable().optional(),
);

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

// ============================================
// BATCH FEATURES
// ============================================

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

// ============================================
// BASE BATCH SCHEMA
// ============================================

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

// ============================================
// SHARED VALIDATION HELPERS
// ============================================

function validateBatchPricing(data: {
  isFree?: boolean;
  originalPrice?: string;
  discountPrice?: string;
}): boolean {
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

// ============================================
// SHARED BATCH VALIDATION
// ============================================

const batchFormBaseSchema = baseBatchSchema.omit({
  createdBy: true,
});

function validateBatchFields(
  data: {
    isFree?: boolean;
    originalPrice?: string;
    discountPrice?: string;
    startDate?: Date;
    expiryDate?: Date | null;
    validityMonths?: number | null;
  },
  ctx: z.RefinementCtx,
  options: {
    validateSchedule: boolean;
  },
) {
  // Pricing validation
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

  // Schedule validation
  if (options.validateSchedule && !validateBatchSchedule(data)) {
    ctx.addIssue({
      code: "custom",
      message: "Provide either expiry date or validity months, not both.",
      path: ["expiryDate"],
    });
  }

  // Expiry date validation
  if (data.startDate && data.expiryDate && data.expiryDate <= data.startDate) {
    ctx.addIssue({
      code: "custom",
      message: "Expiry date must be after the start date",
      path: ["expiryDate"],
    });
  }
}

// ============================================
// CREATE BATCH SCHEMA
// ============================================

export const createBatchSchema = batchFormBaseSchema.superRefine(
  (data, ctx) => {
    // Start date must be today or future.
    if (!isValidStartDate(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: "Batch start date cannot be earlier than today's date",
        path: ["startDate"],
      });
    }

    validateBatchFields(data, ctx, {
      validateSchedule: true,
    });
  },
);

// ============================================
// UPDATE BATCH SCHEMA
// ============================================

export const updateBatchSchema = batchFormBaseSchema
  .partial()
  .superRefine((data, ctx) => {
    // Past start dates are allowed during updates.

    const hasScheduleField =
      data.expiryDate !== undefined || data.validityMonths !== undefined;

    validateBatchFields(data, ctx, {
      validateSchedule: hasScheduleField,
    });
  });

// ============================================
// FORM SCHEMA FACTORY
// ============================================

/**
 * Returns a full form schema for both create and update.
 *
 * Create:
 * - Past start dates are rejected.
 *
 * Update:
 * - Past start dates are allowed.
 *
 * All other form validations remain identical.
 */
export function getBatchFormSchema(isEditing: boolean) {
  return batchFormBaseSchema.superRefine((data, ctx) => {
    if (!isEditing && !isValidStartDate(data.startDate)) {
      ctx.addIssue({
        code: "custom",
        message: "Batch start date cannot be earlier than today's date",
        path: ["startDate"],
      });
    }

    validateBatchFields(data, ctx, {
      validateSchedule: true,
    });
  });
}

// ============================================
// TYPES
// ============================================

export type CreateBatchInput = z.infer<typeof createBatchSchema>;

export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;

export type CreateBatchFormInput = z.input<typeof createBatchSchema>;

export type BatchFormSchema = ReturnType<typeof getBatchFormSchema>;

export type BatchFormValues = z.input<BatchFormSchema>;

export type BatchFormOutput = z.output<BatchFormSchema>;

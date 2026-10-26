import { z } from "zod";
import {
  batchMediumEnum,
  batchStatusEnum,
  lectureTypeEnum,
  lectureStatusEnum,
  orderStatusEnum,
  paymentStatusEnum,
  enrollmentStatusEnum,
} from "@/db/schema/academic-enums";

export const batchMediumSchema = z.enum(batchMediumEnum.enumValues);
export const batchStatusSchema = z.enum(batchStatusEnum.enumValues);
export const lectureTypeSchema = z.enum(lectureTypeEnum.enumValues);
export const lectureStatusSchema = z.enum(lectureStatusEnum.enumValues);
export const orderStatusSchema = z.enum(orderStatusEnum.enumValues);
export const paymentStatusSchema = z.enum(paymentStatusEnum.enumValues);
export const enrollmentStatusSchema = z.enum(enrollmentStatusEnum.enumValues);

const idSchema = z.string().trim().min(1, "ID is required");

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

const decimalSchema = z
  .union([z.string(), z.number()])
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Must be a valid non-negative amount",
  })
  .transform((val) => Number(val).toFixed(2));

export const createExamCategorySchema = z.object({
  name: z.string().trim().min(2, "Category name is required").max(100),
  slug: slugSchema,
  iconUrl: z.string().url("Invalid icon URL").optional().nullable(),
  isActive: z.boolean().default(true),
});

export const updateExamCategorySchema = createExamCategorySchema.partial();

export const createExaminationSchema = z.object({
  name: z.string().trim().min(2, "Examination name is required").max(150),
  slug: slugSchema,
  categoryId: idSchema,
  isActive: z.boolean().default(true),
});

export const updateExaminationSchema = createExaminationSchema.partial();

export const createManagerProfileSchema = z.object({
  userId: idSchema,
  department: z.string().trim().min(2).default("Operations"),
  employeeCode: z.string().trim().min(2).optional().nullable(),
});

export const updateManagerProfileSchema = createManagerProfileSchema
  .omit({ userId: true })
  .partial();

export const createTeacherProfileSchema = z.object({
  userId: idSchema,
  subject: z.string().trim().min(2, "Primary subject is required"),
  experienceYears: z.coerce.number().int().min(0).max(60).default(1),
  qualification: z.string().trim().optional().nullable(),
  bio: z
    .string()
    .trim()
    .max(2000, "Bio cannot exceed 2000 characters")
    .optional()
    .nullable(),
});

export const updateTeacherProfileSchema = createTeacherProfileSchema
  .omit({ userId: true })
  .partial();

export const createStudentProfileSchema = z.object({
  userId: idSchema,
  targetExamId: idSchema.optional().nullable(),
  preferredMedium: batchMediumSchema.default("HINGLISH"),
  state: z.string().trim().default("Madhya Pradesh").optional().nullable(),
  city: z.string().trim().optional().nullable(),
});

export const updateStudentProfileSchema = createStudentProfileSchema
  .omit({ userId: true })
  .partial();

const baseBatchSchema = z.object({
  examinationId: idSchema,
  createdBy: idSchema,
  title: z
    .string()
    .trim()
    .min(3, "Title must be at least 3 characters")
    .max(200),
  slug: slugSchema,
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters"),
  thumbnail: z.string().url("Thumbnail must be a valid URL"),
  previewVideo: z
    .string()
    .url("Preview video must be a valid URL")
    .optional()
    .nullable(),
  originalPrice: decimalSchema,
  discountPrice: decimalSchema,
  isFree: z.boolean().default(false),
  startDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional().nullable(),
  validityMonths: z.coerce
    .number()
    .int()
    .positive()
    .default(12)
    .optional()
    .nullable(),
  medium: batchMediumSchema.default("HINGLISH"),
  status: batchStatusSchema.default("UPCOMING"),
  isPublished: z.boolean().default(false),
});

export const createBatchSchema = baseBatchSchema
  .refine((data) => Number(data.discountPrice) <= Number(data.originalPrice), {
    message: "Discount price cannot be greater than original price",
    path: ["discountPrice"],
  })
  .refine((data) => !data.expiryDate || data.expiryDate > data.startDate, {
    message: "Expiry date must be after the start date",
    path: ["expiryDate"],
  });

export const updateBatchSchema = baseBatchSchema
  .omit({ createdBy: true })
  .partial()
  .refine(
    (data) => {
      if (
        data.originalPrice !== undefined &&
        data.discountPrice !== undefined
      ) {
        return Number(data.discountPrice) <= Number(data.originalPrice);
      }
      return true;
    },
    {
      message: "Discount price cannot be greater than original price",
      path: ["discountPrice"],
    },
  );

export const createSubjectSchema = z.object({
  name: z.string().trim().min(2, "Subject name is required").max(100),
  batchId: z.string().trim().min(1, "Batch ID is required"),
});

export const updateSubjectSchema = createSubjectSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export const createChapterSchema = z.object({
  subjectId: idSchema,
  title: z.string().trim().min(2, "Chapter title is required").max(150),
  sortOrder: z.coerce.number().int().positive().default(1),
});

export const updateChapterSchema = createChapterSchema.partial();

const baseLectureSchema = z.object({
  title: z.string().trim().min(3, "Lecture title is required").max(200),
  subjectId: idSchema,
  chapterId: idSchema,
  teacherId: idSchema,
  lectureType: lectureTypeSchema,
  status: lectureStatusSchema,
  scheduledAt: z.coerce.date().optional().nullable(),
  durationMinutes: z.coerce.number().int().positive().optional().nullable(),
  isFreeDemo: z.boolean(),
  zoomMeetingId: z.string().trim().optional().nullable(),
  zoomPasscode: z.string().trim().optional().nullable(),
  bunnyLibraryId: z.string().trim().optional().nullable(),
  bunnyVideoId: z.string().trim().optional().nullable(),
  classNotesPdfUrl: z.string().url("Invalid PDF URL").optional().nullable(),
  dppPdfUrl: z.string().url("Invalid DPP PDF URL").optional().nullable(),
});

export const createLectureSchema = baseLectureSchema
  .extend({
    lectureType: lectureTypeSchema.default("LIVE"),
    status: lectureStatusSchema.default("UPCOMING"),
    isFreeDemo: z.boolean().default(false),
  })
  .refine((data) => !(data.lectureType === "LIVE" && !data.scheduledAt), {
    message: "Scheduled date/time is required for LIVE lectures",
    path: ["scheduledAt"],
  });

export const updateLectureSchema = baseLectureSchema
  .partial()
  .superRefine((data, ctx) => {
    if (data.lectureType === "LIVE" && !data.scheduledAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Scheduled date/time is required for LIVE lectures",
        path: ["scheduledAt"],
      });
    }

    if (data.scheduledAt === null && data.lectureType !== "VOD") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Cannot remove scheduledAt unless lectureType is VOD",
        path: ["scheduledAt"],
      });
    }
  });

export const batchTeacherSchema = z.object({
  batchId: idSchema,
  teacherId: idSchema,
});

export const batchSubjectSchema = z.object({
  batchId: idSchema,
  subjectId: idSchema,
  sortOrder: z.coerce.number().int().positive().default(1),
});

export const batchLectureSchema = z.object({
  batchId: idSchema,
  lectureId: idSchema,
});

export const createOrderSchema = z.object({
  userId: idSchema,
  batchId: idSchema,
  amount: decimalSchema,
  status: orderStatusSchema.default("PENDING"),
  razorpayOrderId: z.string().trim().optional().nullable(),
});

export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
  razorpayOrderId: z.string().trim().optional(),
});

export const createPaymentSchema = z.object({
  orderId: idSchema,
  userId: idSchema,
  razorpayPaymentId: z.string().trim().optional().nullable(),
  razorpaySignature: z.string().trim().optional().nullable(),
  amount: decimalSchema,
  status: paymentStatusSchema.default("PENDING"),
});

export const verifyRazorpayPaymentSchema = z.object({
  orderId: idSchema,
  razorpayOrderId: z.string().min(1, "Razorpay Order ID is required"),
  razorpayPaymentId: z.string().min(1, "Razorpay Payment ID is required"),
  razorpaySignature: z.string().min(1, "Razorpay Signature is required"),
});

export const createEnrollmentSchema = z.object({
  userId: idSchema,
  batchId: idSchema,
  orderId: idSchema.optional().nullable(),
  status: enrollmentStatusSchema.default("ACTIVE"),
  expiresAt: z.coerce.date().optional().nullable(),
});

export const updateEnrollmentSchema = z.object({
  status: enrollmentStatusSchema.optional(),
  expiresAt: z.coerce.date().optional().nullable(),
});

export type CreateExamCategoryInput = z.infer<typeof createExamCategorySchema>;
export type CreateExaminationInput = z.infer<typeof createExaminationSchema>;
export type CreateManagerProfileInput = z.infer<
  typeof createManagerProfileSchema
>;
export type CreateTeacherProfileInput = z.infer<
  typeof createTeacherProfileSchema
>;
export type CreateStudentProfileInput = z.infer<
  typeof createStudentProfileSchema
>;
export type CreateBatchInput = z.infer<typeof createBatchSchema>;
export type UpdateBatchInput = z.infer<typeof updateBatchSchema>;
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;
export type CreateChapterInput = z.infer<typeof createChapterSchema>;
export type CreateLectureInput = z.infer<typeof createLectureSchema>;
export type UpdateLectureInput = z.infer<typeof updateLectureSchema>;
export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type VerifyRazorpayPaymentInput = z.infer<
  typeof verifyRazorpayPaymentSchema
>;
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

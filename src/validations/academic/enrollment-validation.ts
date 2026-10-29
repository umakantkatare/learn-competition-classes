import { z } from "zod";

import { enrollmentStatusEnum } from "@/db/schema/academic-enums";

export const enrollmentStatusSchema = z.enum(enrollmentStatusEnum.enumValues);

const idSchema = z.string().trim().min(1, "Enrollment ID is required");

export const createEnrollmentSchema = z
  .object({
    userId: idSchema,
    batchId: idSchema,
    orderId: idSchema.nullable().optional(),
    status: enrollmentStatusSchema.default("ACTIVE"),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .strict();

export const updateEnrollmentSchema = z
  .object({
    status: enrollmentStatusSchema.optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required to update enrollment.",
  });

// Types
export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;

export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;

import { z } from "zod";
import { enrollmentStatusEnum } from "@/db/schema/academic-enums";

export const enrollmentStatusSchema = z.enum(enrollmentStatusEnum.enumValues);

const idSchema = (field: string) =>
  z.string().trim().min(1, `${field} is required`);

export const createEnrollmentSchema = z
  .object({
    userId: idSchema("User ID"),
    batchId: idSchema("Batch ID"),
    orderId: idSchema("Order ID").nullable().optional(),
    expiresAt: z.coerce
      .date()
      .refine((date) => date.getTime() > Date.now(), {
        message: "Expiry date must be in the future.",
      })
      .nullable()
      .optional(),
  })
  .strict();

export const updateEnrollmentSchema = z
  .object({
    status: enrollmentStatusSchema.optional(),
    expiresAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine((data) => data.status !== undefined || data.expiresAt !== undefined, {
    message: "At least one field is required to update enrollment.",
  });

export type CreateEnrollmentInput = z.infer<typeof createEnrollmentSchema>;
export type UpdateEnrollmentInput = z.infer<typeof updateEnrollmentSchema>;

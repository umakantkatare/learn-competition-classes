import { z } from "zod";

import { paymentStatusEnum } from "@/db/schema/academic-enums";

export const paymentStatusSchema = z.enum(paymentStatusEnum.enumValues);

const idSchema = z.string().trim().min(1, "Payment ID is required");

const razorpayPaymentIdSchema = z
  .string()
  .trim()
  .min(1, "Razorpay Payment ID is required");

const razorpayOrderIdSchema = z
  .string()
  .trim()
  .min(1, "Razorpay Order ID is required");

const razorpaySignatureSchema = z
  .string()
  .trim()
  .regex(/^[a-fA-F0-9]{64}$/, "Invalid Razorpay signature");

// Create payment: server-side use only
export const createPaymentSchema = z
  .object({
    orderId: idSchema,
    userId: idSchema,
    amount: z.string().regex(/^\d+(\.\d{1,2})?$/, "Invalid payment amount"),
    status: paymentStatusSchema.default("PENDING"),
    razorpayPaymentId: razorpayPaymentIdSchema.nullable().optional(),
    razorpaySignature: razorpaySignatureSchema.nullable().optional(),
  })
  .strict();

// Verify payment: request from the client
export const verifyRazorpayPaymentSchema = z
  .object({
    orderId: idSchema,
    razorpayOrderId: razorpayOrderIdSchema,
    razorpayPaymentId: razorpayPaymentIdSchema,
    razorpaySignature: razorpaySignatureSchema,
  })
  .strict();

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

export type VerifyRazorpayPaymentInput = z.infer<
  typeof verifyRazorpayPaymentSchema
>;

import { z } from "zod";

import { orderStatusEnum } from "@/db/schema/academic-enums";
export const orderStatusSchema = z.enum(orderStatusEnum.enumValues);

export type OrderStatus = z.infer<typeof orderStatusSchema>;

const idSchema = z.string().trim().min(1, "ID is required");
const decimalSchema = z
  .union([z.string(), z.number()])
  .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Must be a valid non-negative amount",
  })
  .transform((val) => Number(val).toFixed(2));

export const createOrderRequestSchema = z
  .object({
    batchId: idSchema,
  })
  .strict();

export type CreateOrderRequest = z.infer<typeof createOrderRequestSchema>;

export const createOrderSchema = z
  .object({
    userId: idSchema,
    batchId: idSchema,
    amount: decimalSchema,
    status: orderStatusSchema.default("PENDING"),
    razorpayOrderId: z.string().trim().min(1).nullable().optional(),
  })
  .strict();

export const updateOrderStatusSchema = z
  .object({
    status: orderStatusSchema,
    razorpayOrderId: z
      .string()
      .trim()
      .min(1, "Razorpay order ID cannot be empty")
      .optional(),
  })
  .strict();

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;

export type CreateOrderInput = z.input<typeof createOrderSchema>;

export type CreateOrderOutput = z.output<typeof createOrderSchema>;

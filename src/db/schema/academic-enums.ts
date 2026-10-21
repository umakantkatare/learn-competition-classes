import { pgEnum } from "drizzle-orm/pg-core";

export const batchMediumEnum = pgEnum("batch_medium", [
  "HINDI",
  "ENGLISH",
  "HINGLISH",
]);

export const batchStatusEnum = pgEnum("batch_status", [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
]);

export const lectureTypeEnum = pgEnum("lecture_type", ["LIVE", "VOD"]);

export const lectureStatusEnum = pgEnum("lecture_status", [
  "UPCOMING",
  "LIVE",
  "PROCESSING",
  "COMPLETED",
  "CANCELLED",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "PENDING",
  "PAID",
  "FAILED",
  "CANCELLED",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "SUCCESS",
  "FAILED",
  "PENDING",
  "REFUNDED",
]);

export const enrollmentStatusEnum = pgEnum("enrollment_status", [
  "ACTIVE",
  "EXPIRED",
  "REFUNDED",
]);

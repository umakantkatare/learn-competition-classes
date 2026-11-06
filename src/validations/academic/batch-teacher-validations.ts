import { z } from "zod";
import { idSchema } from "./batch-validation";

export const assignBatchTeacherSchema = z.object({
  batchId: idSchema,
  teacherId: idSchema,
});

export const assignBatchTeachersSchema = z.object({
  teacherIds: z
    .array(idSchema)
    .default([])
    .refine(
      (ids) => new Set(ids).size === ids.length,
      "Duplicate teachers are not allowed",
    ),
});

export const removeBatchTeacherSchema = z.object({
  batchId: idSchema,
  teacherId: idSchema,
});

export type AssignBatchTeacherInput = z.infer<typeof assignBatchTeacherSchema>;

export type AssignBatchTeachersInput = z.infer<
  typeof assignBatchTeachersSchema
>;

export type RemoveBatchTeacherInput = z.infer<typeof removeBatchTeacherSchema>;

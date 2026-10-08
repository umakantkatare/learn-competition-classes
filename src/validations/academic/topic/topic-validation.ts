import { z } from "zod";

export const createTopicSchema = z.object({
  subjectId: z.string().trim().min(1, "Subject is required"),

  name: z
    .string()
    .trim()
    .min(1, "Topic name is required")
    .max(100, "Topic name must be 100 characters or less"),

  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .max(120, "Slug must be 120 characters or less")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must contain only lowercase letters, numbers and hyphens",
    ),

  isActive: z.boolean(),
});

export const updateTopicSchema = createTopicSchema;

export type CreateTopicInput = z.infer<typeof createTopicSchema>;

export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;

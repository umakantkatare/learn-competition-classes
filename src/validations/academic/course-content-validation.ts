import { z } from "zod";

export const courseContentTypeSchema = z.enum([
  "VIDEO",
  "PDF",
  "TEST",
]);

export const createCourseContentSchema = z
  .object({
    courseId: z.string().trim().min(1),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).nullable(),

    type: courseContentTypeSchema,

    videoId: z.string().trim().nullable(),
    fileUrl: z.string().trim().nullable(),
    thumbnail: z.string().trim().nullable(),

    subjectId: z.string().trim().nullable(),
    topicId: z.string().trim().nullable(),

    sortOrder: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(false),
    isPreview: z.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.type === "VIDEO" && !data.videoId?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["videoId"],
        message: "Video ID is required for video content",
      });
    }

    if (data.type === "PDF" && !data.fileUrl?.trim()) {
      ctx.addIssue({
        code: "custom",
        path: ["fileUrl"],
        message: "File URL is required for PDF content",
      });
    }

    if (data.topicId && !data.subjectId) {
      ctx.addIssue({
        code: "custom",
        path: ["subjectId"],
        message: "A subject is required when a topic is selected",
      });
    }

    if (data.isPreview && data.type !== "VIDEO") {
      ctx.addIssue({
        code: "custom",
        path: ["isPreview"],
        message: "Only video content can be marked as a preview",
      });
    }
  });

export type CreateCourseContentInput = z.infer<
  typeof createCourseContentSchema
>;

export const updateCourseContentSchema = createCourseContentSchema;

export type UpdateCourseContentInput = z.infer<
  typeof updateCourseContentSchema
>;
import { defineRelations } from "drizzle-orm";

import { course } from "@/db/schema/course-schema";
import { courseSubject } from "@/db/schema/course-subject-schema";
import { courseContent } from "@/db/schema/course-content-schema";
import { subject } from "@/db/schema/subject-schema";
import { topic } from "@/db/schema/topic-schema";

export const relations = defineRelations(
  {
    course,
    courseSubject,
    courseContent,
    subject,
    topic,
  },
  (r) => ({
    course: {
      subjects: r.many.courseSubject(),
      contents: r.many.courseContent(),
    },

    courseSubject: {
      course: r.one.course({
        from: r.courseSubject.courseId,
        to: r.course.id,
      }),

      subject: r.one.subject({
        from: r.courseSubject.subjectId,
        to: r.subject.id,
      }),
    },

    courseContent: {
      course: r.one.course({
        from: r.courseContent.courseId,
        to: r.course.id,
      }),

      subject: r.one.subject({
        from: r.courseContent.subjectId,
        to: r.subject.id,
      }),

      topic: r.one.topic({
        from: r.courseContent.topicId,
        to: r.topic.id,
      }),
    },
  }),
);

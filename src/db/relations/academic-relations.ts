import { defineRelations } from "drizzle-orm";
import {
  managerProfiles,
  teacherProfiles,
  studentProfiles,
  examCategory,
  examination,
  batch,
  batchTeachers,
  subject,
  chapter,
  lecture,
  batchSubjects,
  batchLectures,
  orders,
  payments,
  enrollment,
} from "../schema/academic-schema";
import { user } from "../schema/auth-schema";

export const academicRelations = defineRelations(
  {
    user,
    managerProfiles,
    teacherProfiles,
    studentProfiles,
    examCategory,
    examination,
    batch,
    batchTeachers,
    subject,
    chapter,
    lecture,
    batchSubjects,
    batchLectures,
    orders,
    payments,
    enrollment,
  },
  (r) => ({
    user: {
      managerProfile: r.one.managerProfiles({
        from: r.user.id,
        to: r.managerProfiles.userId,
      }),
      teacherProfile: r.one.teacherProfiles({
        from: r.user.id,
        to: r.teacherProfiles.userId,
      }),
      studentProfile: r.one.studentProfiles({
        from: r.user.id,
        to: r.studentProfiles.userId,
      }),
      enrollments: r.many.enrollment({
        from: r.user.id,
        to: r.enrollment.userId,
      }),
      orders: r.many.orders({
        from: r.user.id,
        to: r.orders.userId,
      }),
      payments: r.many.payments({
        from: r.user.id,
        to: r.payments.userId,
      }),
      createdBatches: r.many.batch({
        from: r.user.id,
        to: r.batch.createdBy,
      }),
    },

    managerProfiles: {
      user: r.one.user({
        from: r.managerProfiles.userId,
        to: r.user.id,
      }),
    },

    teacherProfiles: {
      user: r.one.user({
        from: r.teacherProfiles.userId,
        to: r.user.id,
      }),
      batchTeachers: r.many.batchTeachers({
        from: r.teacherProfiles.id,
        to: r.batchTeachers.teacherId,
      }),
      lectures: r.many.lecture({
        from: r.teacherProfiles.id,
        to: r.lecture.teacherId,
      }),
    },

    studentProfiles: {
      user: r.one.user({
        from: r.studentProfiles.userId,
        to: r.user.id,
      }),
      targetExam: r.one.examination({
        from: r.studentProfiles.targetExamId,
        to: r.examination.id,
      }),
    },

    examCategory: {
      examinations: r.many.examination({
        from: r.examCategory.id,
        to: r.examination.categoryId,
      }),
    },

    examination: {
      category: r.one.examCategory({
        from: r.examination.categoryId,
        to: r.examCategory.id,
      }),
      batches: r.many.batch({
        from: r.examination.id,
        to: r.batch.examinationId,
      }),
      interestedStudents: r.many.studentProfiles({
        from: r.examination.id,
        to: r.studentProfiles.targetExamId,
      }),
    },

    batch: {
      examination: r.one.examination({
        from: r.batch.examinationId,
        to: r.examination.id,
      }),
      creator: r.one.user({
        from: r.batch.createdBy,
        to: r.user.id,
      }),
      teachers: r.many.batchTeachers({
        from: r.batch.id,
        to: r.batchTeachers.batchId,
      }),
      batchSubjects: r.many.batchSubjects({
        from: r.batch.id,
        to: r.batchSubjects.batchId,
      }),
      batchLectures: r.many.batchLectures({
        from: r.batch.id,
        to: r.batchLectures.batchId,
      }),
      enrollments: r.many.enrollment({
        from: r.batch.id,
        to: r.enrollment.batchId,
      }),
      orders: r.many.orders({
        from: r.batch.id,
        to: r.orders.batchId,
      }),
    },

    batchTeachers: {
      batch: r.one.batch({
        from: r.batchTeachers.batchId,
        to: r.batch.id,
      }),
      teacher: r.one.teacherProfiles({
        from: r.batchTeachers.teacherId,
        to: r.teacherProfiles.id,
      }),
    },

    subject: {
      chapters: r.many.chapter({
        from: r.subject.id,
        to: r.chapter.subjectId,
      }),
      lectures: r.many.lecture({
        from: r.subject.id,
        to: r.lecture.subjectId,
      }),
      batchSubjects: r.many.batchSubjects({
        from: r.subject.id,
        to: r.batchSubjects.subjectId,
      }),
    },

    chapter: {
      subject: r.one.subject({
        from: r.chapter.subjectId,
        to: r.subject.id,
      }),
      lectures: r.many.lecture({
        from: r.chapter.id,
        to: r.lecture.chapterId,
      }),
    },

    lecture: {
      subject: r.one.subject({
        from: r.lecture.subjectId,
        to: r.subject.id,
      }),
      chapter: r.one.chapter({
        from: r.lecture.chapterId,
        to: r.chapter.id,
      }),
      teacher: r.one.teacherProfiles({
        from: r.lecture.teacherId,
        to: r.teacherProfiles.id,
      }),
      batchLectures: r.many.batchLectures({
        from: r.lecture.id,
        to: r.batchLectures.lectureId,
      }),
    },

    orders: {
      user: r.one.user({
        from: r.orders.userId,
        to: r.user.id,
      }),
      batch: r.one.batch({
        from: r.orders.batchId,
        to: r.batch.id,
      }),
      payments: r.many.payments({
        from: r.orders.id,
        to: r.payments.orderId,
      }),
      enrollments: r.many.enrollment({
        from: r.orders.id,
        to: r.enrollment.orderId,
      }),
    },

    payments: {
      order: r.one.orders({
        from: r.payments.orderId,
        to: r.orders.id,
      }),
      user: r.one.user({
        from: r.payments.userId,
        to: r.user.id,
      }),
    },

    enrollment: {
      user: r.one.user({
        from: r.enrollment.userId,
        to: r.user.id,
      }),
      batch: r.one.batch({
        from: r.enrollment.batchId,
        to: r.batch.id,
      }),
      order: r.one.orders({
        from: r.enrollment.orderId,
        to: r.orders.id,
      }),
    },
  }),
);

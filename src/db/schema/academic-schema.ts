import {
  pgTable,
  text,
  boolean,
  timestamp,
  integer,
  decimal,
  primaryKey,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import { user } from "./auth-schema";
import {
  batchMediumEnum,
  batchStatusEnum,
  lectureTypeEnum,
  lectureStatusEnum,
  orderStatusEnum,
  paymentStatusEnum,
  enrollmentStatusEnum,
} from "./academic-enums";

export const examCategory = pgTable("exam_category", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  iconUrl: text("icon_url"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const examination = pgTable(
  "examination",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: text("name").notNull(),
    slug: text("slug").notNull().unique(),
    categoryId: text("category_id")
      .notNull()
      .references(() => examCategory.id, { onDelete: "restrict" }),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("examination_categoryId_idx").on(table.categoryId)],
);

export const managerProfiles = pgTable(
  "manager_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    department: text("department").default("Operations").notNull(),
    employeeCode: text("employee_code").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("manager_profiles_userId_idx").on(table.userId)],
);

export const teacherProfiles = pgTable(
  "teacher_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    subject: text("subject").notNull(),
    experienceYears: integer("experience_years").default(1).notNull(),
    qualification: text("qualification"),
    bio: text("bio"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [index("teacher_profiles_userId_idx").on(table.userId)],
);

export const studentProfiles = pgTable(
  "student_profiles",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .unique()
      .references(() => user.id, { onDelete: "cascade" }),
    targetExamId: text("target_exam_id").references(() => examination.id, {
      onDelete: "set null",
    }),
    preferredMedium: batchMediumEnum("preferred_medium")
      .default("HINGLISH")
      .notNull(),
    state: text("state").default("Madhya Pradesh"),
    city: text("city"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("student_profiles_userId_idx").on(table.userId),
    index("student_profiles_targetExamId_idx").on(table.targetExamId),
  ],
);

export const batch = pgTable(
  "batch",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    examinationId: text("examination_id")
      .notNull()
      .references(() => examination.id, { onDelete: "restrict" }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description").notNull(),
    thumbnail: text("thumbnail").notNull(),
    previewVideo: text("preview_video"),

    originalPrice: decimal("original_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    discountPrice: decimal("discount_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    isFree: boolean("is_free").default(false).notNull(),

    startDate: timestamp("start_date").notNull(),
    expiryDate: timestamp("expiry_date"),
    validityMonths: integer("validity_months").default(12),
    medium: batchMediumEnum("medium").default("HINGLISH").notNull(),
    status: batchStatusEnum("status").default("UPCOMING").notNull(),
    isPublished: boolean("is_published").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index("batch_examinationId_idx").on(table.examinationId),
    index("batch_createdBy_idx").on(table.createdBy),
  ],
);

export const batchTeachers = pgTable(
  "batch_teachers",
  {
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => teacherProfiles.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.batchId, t.teacherId] }),
    index("batch_teachers_batchId_idx").on(t.batchId),
    index("batch_teachers_teacherId_idx").on(t.teacherId),
  ],
);

export const subject = pgTable("subject", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chapter = pgTable(
  "chapter",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    sortOrder: integer("sort_order").default(1).notNull(),
  },
  (table) => [index("chapter_subjectId_idx").on(table.subjectId)],
);

export const lecture = pgTable(
  "lecture",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    title: text("title").notNull(),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id, { onDelete: "cascade" }),
    chapterId: text("chapter_id")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => teacherProfiles.id),

    lectureType: lectureTypeEnum("lecture_type").default("LIVE").notNull(),
    status: lectureStatusEnum("status").default("UPCOMING").notNull(),
    scheduledAt: timestamp("scheduled_at"),
    durationMinutes: integer("duration_minutes"),
    isFreeDemo: boolean("is_free_demo").default(false).notNull(),

    zoomMeetingId: text("zoom_meeting_id"),
    zoomPasscode: text("zoom_passcode"),
    bunnyLibraryId: text("bunny_library_id"),
    bunnyVideoId: text("bunny_video_id"),
    classNotesPdfUrl: text("class_notes_pdf_url"),
    dppPdfUrl: text("dpp_pdf_url"),

    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("lecture_subjectId_idx").on(table.subjectId),
    index("lecture_chapterId_idx").on(table.chapterId),
    index("lecture_teacherId_idx").on(table.teacherId),
  ],
);

export const batchSubjects = pgTable(
  "batch_subjects",
  {
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "cascade" }),
    subjectId: text("subject_id")
      .notNull()
      .references(() => subject.id, { onDelete: "cascade" }),
    sortOrder: integer("sort_order").default(1).notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.batchId, t.subjectId] }),
    index("batch_subjects_batchId_idx").on(t.batchId),
  ],
);

export const batchLectures = pgTable(
  "batch_lectures",
  {
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "cascade" }),
    lectureId: text("lecture_id")
      .notNull()
      .references(() => lecture.id, { onDelete: "cascade" }),
  },
  (t) => [
    primaryKey({ columns: [t.batchId, t.lectureId] }),
    index("batch_lectures_batchId_idx").on(t.batchId),
  ],
);

export const orders = pgTable(
  "orders",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "restrict" }),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: orderStatusEnum("status").default("PENDING").notNull(),
    razorpayOrderId: text("razorpay_order_id").unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("orders_userId_idx").on(table.userId),
    index("orders_batchId_idx").on(table.batchId),
  ],
);

export const payments = pgTable(
  "payments",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    razorpayPaymentId: text("razorpay_payment_id").unique(),
    razorpaySignature: text("razorpay_signature"),
    amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
    status: paymentStatusEnum("status").default("PENDING").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("payments_orderId_idx").on(table.orderId),
    index("payments_userId_idx").on(table.userId),
  ],
);

export const enrollment = pgTable(
  "enrollment",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    batchId: text("batch_id")
      .notNull()
      .references(() => batch.id, { onDelete: "restrict" }),
    orderId: text("order_id").references(() => orders.id, {
      onDelete: "set null",
    }),
    status: enrollmentStatusEnum("status").default("ACTIVE").notNull(),
    enrolledAt: timestamp("enrolled_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"),
  },
  (t) => [
    uniqueIndex("user_batch_unique_idx").on(t.userId, t.batchId),
    index("enrollment_userId_idx").on(t.userId),
    index("enrollment_batchId_idx").on(t.batchId),
  ],
);

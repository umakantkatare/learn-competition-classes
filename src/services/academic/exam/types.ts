import type { InferSelectModel } from "drizzle-orm";
import { exam } from "@/db/schema/exam-schema";

export type Exam = InferSelectModel<typeof exam>;
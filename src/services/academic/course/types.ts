import type { InferSelectModel } from "drizzle-orm";

import { course } from "@/db/schema/course-schema";

export type Course = InferSelectModel<typeof course>;

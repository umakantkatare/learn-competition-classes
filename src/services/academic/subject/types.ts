import type { InferSelectModel } from "drizzle-orm";

import { subject } from "@/db/schema/subject-schema";

export type Subject = InferSelectModel<typeof subject>;

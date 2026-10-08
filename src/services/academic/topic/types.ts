import type { InferSelectModel } from "drizzle-orm";

import { topic } from "@/db/schema/topic-schema";

export type Topic = InferSelectModel<typeof topic>;

export interface TopicWithSubject extends Topic {
  subject: {
    id: string;
    name: string;
  };
}
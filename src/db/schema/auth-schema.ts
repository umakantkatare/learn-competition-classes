import { randomUUID } from "node:crypto";
import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

export const webhookEventStatusEnum = pgEnum("webhook_event_status", [
  "PROCESSING",
  "PROCESSED",
  "FAILED",
]);

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => randomUUID()),

    eventId: text("event_id").notNull(),

    eventType: text("event_type").notNull(),

    status: webhookEventStatusEnum("status").default("PROCESSING").notNull(),

    payload: jsonb("payload").$type<Record<string, unknown>>(),

    attempts: integer("attempts").default(1).notNull(),

    errorMessage: text("error_message"),

    receivedAt: timestamp("received_at").defaultNow().notNull(),

    processedAt: timestamp("processed_at"),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("webhook_events_event_id_unique").on(table.eventId),
    index("webhook_events_status_idx").on(table.status),
    index("webhook_events_received_at_idx").on(table.receivedAt),
  ],
);

export type WebhookEvent = typeof webhookEvents.$inferSelect;
export type NewWebhookEvent = typeof webhookEvents.$inferInsert;

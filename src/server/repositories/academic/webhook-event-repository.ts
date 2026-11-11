import "server-only";

import { db } from "@/db";
import { webhookEvents } from "@/db/schema/webhook-event";
import { and, eq, sql } from "drizzle-orm";

export class WebhookEventRepository {
  async claimEvent(data: {
    eventId: string;
    eventType: string;
    payload?: Record<string, unknown>;
  }) {
    // First delivery: insert a PROCESSING event.
    const [created] = await db
      .insert(webhookEvents)
      .values({
        eventId: data.eventId,
        eventType: data.eventType,
        payload: data.payload,
        status: "PROCESSING",
        attempts: 1,
      })
      .onConflictDoNothing({
        target: webhookEvents.eventId,
      })
      .returning();

    if (created) {
      return {
        claimed: true,
        event: created,
      };
    }

    // Retry only if the previous attempt failed.
    ThisUpdate: {
      const [retried] = await db
        .update(webhookEvents)
        .set({
          status: "PROCESSING",
          attempts: sql`${webhookEvents.attempts} + 1`,
          errorMessage: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(webhookEvents.eventId, data.eventId),
            eq(webhookEvents.status, "FAILED"),
          ),
        )
        .returning();

      if (retried) {
        return {
          claimed: true,
          event: retried,
        };
      }
    }

    const [existing] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, data.eventId))
      .limit(1);

    return {
      claimed: false,
      event: existing ?? null,
    };
  }

  async markProcessed(eventId: string) {
    const [event] = await db
      .update(webhookEvents)
      .set({
        status: "PROCESSED",
        processedAt: new Date(),
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(webhookEvents.eventId, eventId),
          eq(webhookEvents.status, "PROCESSING"),
        ),
      )
      .returning();

    return event ?? null;
  }

  async markFailed(eventId: string, errorMessage: string) {
    const [event] = await db
      .update(webhookEvents)
      .set({
        status: "FAILED",
        errorMessage: errorMessage.slice(0, 2000),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(webhookEvents.eventId, eventId),
          eq(webhookEvents.status, "PROCESSING"),
        ),
      )
      .returning();

    return event ?? null;
  }

  async findByEventId(eventId: string) {
    const [event] = await db
      .select()
      .from(webhookEvents)
      .where(eq(webhookEvents.eventId, eventId))
      .limit(1);

    return event ?? null;
  }
}

import { and, eq, gt, isNull, or } from "drizzle-orm";

import { db } from "@/db";
import { enrollment } from "@/db/schema/enrollment-schema";

export async function getActiveEnrollment(userId: string, courseId: string) {
  const now = new Date();

  const [activeEnrollment] = await db
    .select()
    .from(enrollment)
    .where(
      and(
        eq(enrollment.userId, userId),
        eq(enrollment.courseId, courseId),
        eq(enrollment.status, "ACTIVE"),
        or(isNull(enrollment.expiresAt), gt(enrollment.expiresAt, now)),
      ),
    )
    .limit(1);

  return activeEnrollment ?? null;
}

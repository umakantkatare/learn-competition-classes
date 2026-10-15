"use client";

import { Course } from "@/server/services/course-api";
import Image from "next/image";

type CourseCardProps = {
  course: Course;
};

export function CourseCard({ course }: CourseCardProps) {
  const displayPrice = (amount: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount / 100);

  return (
    <article className="overflow-hidden rounded-xl border bg-card">
      <div className="relative aspect-video bg-muted">
        {course.thumbnail ? (
          <Image
            src={course.thumbnail}
            alt={course.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No thumbnail available
          </div>
        )}
      </div>

      <div className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-semibold leading-snug">{course.name}</h2>

          <span
            className={
              course.isActive
                ? "rounded-full bg-green-100 px-2 py-1 text-xs text-green-800"
                : "rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground"
            }
          >
            {course.isActive ? "Active" : "Inactive"}
          </span>
        </div>

        {course.description && (
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {course.description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {course.salePrice !== null && course.salePrice < course.price ? (
            <>
              <span className="font-semibold">
                {displayPrice(course.salePrice)}
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {displayPrice(course.price)}
              </span>
            </>
          ) : (
            <span className="font-semibold">{displayPrice(course.price)}</span>
          )}
        </div>

        {course.features.length > 0 && (
          <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
            {course.features.slice(0, 3).map((feature) => (
              <li key={feature}>{feature}</li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}

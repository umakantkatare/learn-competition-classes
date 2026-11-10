"use client";

import Image from "next/image";
import Link from "next/link";
import { CalendarDays, GraduationCap, } from "lucide-react";

import type { Batch } from "@/hooks/academic/use-batches";

// Types

interface BatchCardProps {
  batch: Batch;
}

// Constants

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

 export const statusStyles: Record<Batch["status"], string> = {
  UPCOMING:
    "border-blue-200 bg-blue-100 text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300",

  ONGOING:
    "border-green-200 bg-green-100 text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300",

  COMPLETED:
    "border-gray-200 bg-gray-100 text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export const statusLabels: Record<Batch["status"], string> = {
  UPCOMING: "Upcoming",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
};

// Helpers

function formatDate(date?: string | null): string {
  if (!date) return "To be announced";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "To be announced";
  }

  return dateFormatter.format(parsedDate);
}

function getPrice(value?: string | null): number {
  const price = Number(value ?? 0);

  return Number.isFinite(price) && price > 0 ? price : 0;
}

// Batch Card

export function BatchCard({ batch }: BatchCardProps) {
  const originalPrice = getPrice(batch.originalPrice);
  const discountPrice = getPrice(batch.discountPrice);

  const finalPrice = batch.isFree
    ? 0
    : discountPrice > 0
      ? discountPrice
      : originalPrice;

  const hasDiscount =
    !batch.isFree &&
    originalPrice > 0 &&
    finalPrice > 0 &&
    finalPrice < originalPrice;

  const discountPercentage = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  const thumbnail = batch.thumbnail?.trim() || null;

  const status = batch.status;
  const statusStyle = statusStyles[status];

  const batchUrl = `/batches/${batch.slug}`;

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}

      <Link
        href={batchUrl}
        aria-label={`View ${batch.title}`}
        className="relative mx-3 mt-3 block aspect-[16/9] overflow-hidden rounded-lg bg-muted"
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={batch.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GraduationCap className="size-16 text-muted-foreground/40" />
          </div>
        )}

        {/* Medium Badge */}
        {batch.medium && (
          <span className="absolute left-3 top-3 rounded-md border border-border/50 bg-background/90 px-2.5 py-1 text-xs font-semibold capitalize text-foreground shadow-sm backdrop-blur">
            {batch.medium.toLowerCase()}
          </span>
        )}

        {/* Status Badge */}
        <span
          className={`absolute right-3 top-3 rounded-md border px-2.5 py-1 text-xs font-semibold shadow-sm ${statusStyle}`}
        >
          {statusLabels[status]}
        </span>

        {/* Free Badge */}
        {batch.isFree && (
          <span className="absolute bottom-3 right-3 rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground shadow-sm">
            Free Batch
          </span>
        )}
      </Link>

      {/* Content */}

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {/* Title */}
        <Link href={batchUrl} className="group/title">
          <h2 className="line-clamp-2 min-h-14 text-lg font-bold leading-7 tracking-tight text-card-foreground transition-colors group-hover/title:text-primary">
            {batch.title}
          </h2>
        </Link>

        {/* Start Date */}
        <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarDays className="size-4 shrink-0 text-primary" />

          <span>Starts: {formatDate(batch.startDate)}</span>
        </div>

        {/* Expiry Date */}
        {batch.expiryDate && (
          <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4 shrink-0 text-muted-foreground" />

            <span>Ends: {formatDate(batch.expiryDate)}</span>
          </div>
        )}

        {/* Validity */}
        {batch.validityMonths !== null &&
          batch.validityMonths !== undefined &&
          batch.validityMonths > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Validity: {batch.validityMonths} months
            </p>
          )}

        {/* Pricing */}
        <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-baseline gap-2">
            {batch.isFree ? (
              <span className="text-2xl font-bold text-secondary">FREE</span>
            ) : (
              <>
                <span className="text-2xl font-extrabold tracking-tight text-primary">
                  ₹{currencyFormatter.format(finalPrice)}
                </span>

                {hasDiscount && (
                  <span className="text-sm font-medium text-muted-foreground line-through">
                    ₹{currencyFormatter.format(originalPrice)}
                  </span>
                )}
              </>
            )}
          </div>

          {/* Discount */}
          {hasDiscount && (
            <span className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary">
              {discountPercentage}% OFF
            </span>
          )}
        </div>

        {/* Footer Actions */}

        <div className="mt-auto mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
          <Link
            href={batchUrl}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            View Details
          </Link>

          <Link
            href={batchUrl}
            className="inline-flex h-10 items-center justify-center rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow-md active:scale-[0.98]"
          >
            Enroll Now
          </Link>
        </div>
      </div>
    </article>
  );
}

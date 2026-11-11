"use client";

import type { ElementType, ReactNode } from "react";
import {
  CalendarDays,
  CalendarCheck,
  Clock,
  GraduationCap,
  CheckCircle2,
  Users,
  Globe,
  ShieldCheck,
} from "lucide-react";

import { useGetBatchBySlug } from "@/hooks/academic/use-batches";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { statusLabels, statusStyles } from "@/components/batches/batch-card";
import Image from "next/image";
import RazorpayCheckoutButton from "../payments/checkout-button";

type Batch = NonNullable<ReturnType<typeof useGetBatchBySlug>["data"]>;

interface BatchDetailsProps {
  batch: Batch;
  onEnroll?: () => void;
}

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(date?: string | Date | null): string {
  if (!date) return "—";

  const parsedDate = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return dateFormatter.format(parsedDate);
}

function getNumericPrice(price?: string | number | null): number {
  if (price === null || price === undefined || price === "") {
    return 0;
  }

  const amount = Number(price);

  return Number.isFinite(amount) && amount > 0 ? amount : 0;
}

function formatPrice(price?: string | number | null): string {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const amount = Number(price);

  if (!Number.isFinite(amount) || amount < 0) return "—";

  return currencyFormatter.format(amount);
}

function formatSubjects(subject?: string | string[] | null): string {
  if (!subject) return "";

  const normalize = (items: string[]) =>
    items
      .map((item) => item.trim())
      .filter(Boolean)
      .join(", ");

  if (Array.isArray(subject)) {
    return normalize(subject);
  }

  const value = subject.trim();

  if (!value) return "";

  if (value.startsWith("[") && value.endsWith("]")) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (
        Array.isArray(parsed) &&
        parsed.every((item) => typeof item === "string")
      ) {
        return normalize(parsed);
      }
    } catch {
      // Continue with the original value.
    }
  }

  if (value.startsWith("{") && value.endsWith("}")) {
    return normalize(
      value
        .slice(1, -1)
        .split(/,(?=(?:[^"]*"[^"]*")*[^"]*$)/)
        .map((item) =>
          item
            .trim()
            .replace(/^"(.*)"$/, "$1")
            .replace(/\\"/g, '"'),
        ),
    );
  }

  return value;
}

function getInitials(name?: string | null): string {
  if (!name?.trim()) return "T";

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
}

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-1">
      <h2 className="text-lg font-semibold tracking-tight sm:text-xl">
        {title}
      </h2>

      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: ElementType;
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border p-4">
      <Icon className="mt-0.5 size-5 shrink-0 text-primary" />

      <div className="min-w-0 space-y-1">
        <p className="text-xs text-muted-foreground">{label}</p>

        <div className="break-words text-sm font-medium">{value}</div>
      </div>
    </div>
  );
}

function TeacherCard({
  teacher,
}: {
  teacher: Batch["teachers"][number]["teacher"];
}) {
  if (!teacher) return null;

  const name = teacher.user?.name || "Unknown Teacher";

  return (
    <div className="flex min-w-0 gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
      <Avatar className="size-12 shrink-0 border">
        <AvatarImage src={teacher.user?.image ?? undefined} alt={name} />

        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>

      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h3 className="truncate text-sm font-semibold">{name}</h3>

          <p className="truncate text-xs text-muted-foreground">
            {teacher.user?.email || "—"}
          </p>
        </div>

        <Badge variant="secondary" className="max-w-full whitespace-normal">
          {formatSubjects(teacher.subject) || "Subject not specified"}
        </Badge>

        <div className="space-y-1 text-xs text-muted-foreground">
          <p>{teacher.experienceYears ?? 0} years experience</p>

          {teacher.qualification && (
            <p className="line-clamp-2">{teacher.qualification}</p>
          )}
        </div>
      </div>
    </div>
  );
}

function BatchThumbnail({ batch }: { batch: Batch }) {
  const statusLabel = statusLabels[batch.status] ?? batch.status;

  const statusClass =
    statusStyles[batch.status] ??
    "border-border bg-muted text-muted-foreground";

  return (
    <div className="relative aspect-video overflow-hidden rounded-xl border bg-muted">
      {batch.thumbnail ? (
        <Image
          src={batch.thumbnail}
          alt={`${batch.title} thumbnail`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <GraduationCap className="size-16 text-muted-foreground/40" />
        </div>
      )}

      {batch.medium && (
        <Badge className="absolute left-3 top-3 border border-border/50 bg-background/95 px-3 py-1 capitalize text-foreground shadow-sm backdrop-blur">
          {batch.medium.toLowerCase()}
        </Badge>
      )}

      <Badge
        variant="outline"
        className={`absolute right-3 top-3 border px-3 py-1 font-semibold shadow-sm ${statusClass}`}
      >
        {statusLabel}
      </Badge>
    </div>
  );
}

function BatchFeatures({ features }: { features: string[] }) {
  return (
    <section className="space-y-4">
      <SectionTitle
        title="What You'll Get"
        description="Explore the features and benefits included in this batch."
      />

      {features.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {features.map((feature, index) => (
            <div
              key={`${feature}-${index}`}
              className="flex items-start gap-3 rounded-lg border bg-card p-3"
            >
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600" />

              <span className="break-words text-sm leading-relaxed">
                {feature}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No features available.</p>
      )}
    </section>
  );
}

function BatchSchedule({ batch }: { batch: Batch }) {
  const hasExpiryDate = Boolean(batch.expiryDate);
  const hasValidity = batch.validityMonths != null;

  return (
    <section className="space-y-4">
      <SectionTitle
        title="Batch Schedule"
        description="Important dates and batch validity."
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoItem
          icon={CalendarDays}
          label="Start Date"
          value={formatDate(batch.startDate)}
        />

        {hasExpiryDate ? (
          <InfoItem
            icon={CalendarCheck}
            label="Expiry Date"
            value={formatDate(batch.expiryDate)}
          />
        ) : hasValidity ? (
          <InfoItem
            icon={Clock}
            label="Validity"
            value={`${batch.validityMonths} Months`}
          />
        ) : null}

        <InfoItem
          icon={Globe}
          label="Medium"
          value={batch.medium || "Not specified"}
        />

        <InfoItem
          icon={ShieldCheck}
          label="Batch Status"
          value={statusLabels[batch.status] ?? batch.status}
        />
      </div>
    </section>
  );
}

function BatchTeachers({ batch }: { batch: Batch }) {
  const teachers = batch.teachers ?? [];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SectionTitle
          title="Meet Your Teachers"
          description="Learn from experienced educators."
        />

        <Badge variant="secondary">{teachers.length} Teachers</Badge>
      </div>

      {teachers.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {teachers.map((item) => {
            const teacher = item.teacher;

            if (!teacher) return null;

            return (
              <TeacherCard
                key={item.teacherId || teacher.id}
                teacher={teacher}
              />
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <Users className="mx-auto mb-3 size-9 text-muted-foreground/40" />

          <p className="text-sm font-medium">Teacher information unavailable</p>

          <p className="mt-1 text-xs text-muted-foreground">
            Teacher details will appear here when assigned.
          </p>
        </div>
      )}
    </section>
  );
}

function BatchEnrollmentCard({
  batch,
  onEnroll,
}: {
  batch: Batch;
  onEnroll?: () => void;
}) {
  const originalPrice = getNumericPrice(batch.originalPrice);
  const discountPrice = getNumericPrice(batch.discountPrice);

  const hasDiscount =
    !batch.isFree && originalPrice > 0 && discountPrice < originalPrice;

  const discount = hasDiscount
    ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
    : 0;

  const hasExpiryDate = Boolean(batch.expiryDate);
  const hasValidity = batch.validityMonths != null;

  const statusLabel = statusLabels[batch.status] ?? batch.status;

  const statusClass =
    statusStyles[batch.status] ??
    "border-border bg-muted text-muted-foreground";

  const isCompleted = batch.status === "COMPLETED";

  return (
    <div className="space-y-5 rounded-xl border bg-card p-5 lg:sticky lg:top-6">
      {/* Batch Price */}
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Batch Fee</p>

        {batch.isFree ? (
          <div className="space-y-2">
            <p className="text-3xl font-bold text-emerald-600">FREE</p>

            <Badge variant="secondary">Free Enrollment</Badge>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-3xl font-bold tracking-tight">
                {formatPrice(batch.discountPrice)}
              </span>

              {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatPrice(batch.originalPrice)}
                </span>
              )}
            </div>

            {discount > 0 && (
              <Badge
                variant="secondary"
                className="border-emerald-500/20 bg-emerald-500/10 text-emerald-600"
              >
                Save {discount}%
              </Badge>
            )}
          </div>
        )}
      </div>

      <Separator />

      {/* Batch Information */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Medium</span>

          <span className="text-sm font-medium capitalize">
            {batch.medium || "Not specified"}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Status</span>

          <Badge variant="outline" className={statusClass}>
            {statusLabel}
          </Badge>
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">Start Date</span>

          <span className="text-right text-sm font-medium">
            {formatDate(batch.startDate)}
          </span>
        </div>

        {hasExpiryDate ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Expiry Date</span>

            <span className="text-right text-sm font-medium">
              {formatDate(batch.expiryDate)}
            </span>
          </div>
        ) : hasValidity ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Validity</span>

            <span className="text-sm font-medium">
              {batch.validityMonths} Months
            </span>
          </div>
        ) : null}
      </div>

      <Separator />

      {/* Enrollment */}
      {isCompleted ? (
        <Button className="w-full" size="lg" disabled>
          Enrollment Closed
        </Button>
      ) : batch.isFree ? (
        <Button className="w-full" size="lg" onClick={onEnroll}>
          Enroll for Free
        </Button>
      ) : (
        <RazorpayCheckoutButton
          batchId={batch.id}
          batchTitle={batch.title}
          className="w-full"
        >
          Enroll Now
        </RazorpayCheckoutButton>
      )}

      <p className="text-center text-xs text-muted-foreground">
        Secure enrollment and payment.
      </p>
    </div>
  );
}

export function BatchDetails({ batch, onEnroll }: BatchDetailsProps) {
  const features = batch.features ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 p-4 pb-12 md:p-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}

        <main className="min-w-0 space-y-7 lg:col-span-2">
          <BatchThumbnail batch={batch} />

          {/* Basic Information */}

          <section className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{batch.medium}</Badge>

              <Badge variant="outline">
                <ShieldCheck className="mr-1 size-3" />
                {batch.isPublished ? "Published" : "Draft"}
              </Badge>
            </div>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl">
              {batch.title}
            </h1>

            <p className="whitespace-pre-line break-words text-sm leading-7 text-muted-foreground sm:text-base">
              {batch.description || "No description available."}
            </p>
          </section>

          <Separator />

          <BatchFeatures features={features} />

          <Separator />

          <BatchSchedule batch={batch} />

          <Separator />

          <BatchTeachers batch={batch} />
        </main>

        {/* Enrollment Sidebar */}

        <aside className="min-w-0">
          <BatchEnrollmentCard batch={batch} onEnroll={onEnroll} />
        </aside>
      </div>
    </div>
  );
}

export default BatchDetails;

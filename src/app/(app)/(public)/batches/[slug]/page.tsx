"use client";

import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CalendarCheck,
  Clock,
  GraduationCap,
  Languages,
  CheckCircle2,
  Users,
} from "lucide-react";

import { useGetBatchBySlug } from "@/hooks/academic/use-batches";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { statusLabels, statusStyles } from "@/components/batches/batch-card";

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(date?: string | Date | null) {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(parsedDate);
}

function formatPrice(price?: string | number | null) {
  if (price === null || price === undefined || price === "") {
    return "0";
  }

  return new Intl.NumberFormat("en-IN").format(Number(price) || 0);
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function BatchDetailsPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();

  const { data: batch, isLoading, isError } = useGetBatchBySlug(params.slug);

  // --------------------------------------------------
  // Loading State
  // --------------------------------------------------

  if (isLoading) {
    return (
      <div className="space-y-5 p-6">
        <div className="h-8 w-40 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded-xl bg-muted" />
        <div className="h-48 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  // --------------------------------------------------
  // Error State
  // --------------------------------------------------

  if (isError || !batch) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-6">
        <GraduationCap className="size-12 text-muted-foreground" />

        <h2 className="text-xl font-semibold">Batch not found</h2>

        <p className="text-sm text-muted-foreground">
          This batch may no longer be available.
        </p>

        <Button variant="outline" onClick={() => router.push("/batches")}>
          Back to batches
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // Publication Check
  // --------------------------------------------------

  if (!batch.isPublished) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-3 p-6">
        <GraduationCap className="size-12 text-muted-foreground" />

        <h2 className="text-xl font-semibold">Batch unavailable</h2>

        <p className="text-sm text-muted-foreground">
          This batch is not currently available for enrollment.
        </p>

        <Button variant="outline" onClick={() => router.push("/batches")}>
          Explore batches
        </Button>
      </div>
    );
  }

  // --------------------------------------------------
  // Derived Values
  // --------------------------------------------------

  const originalPrice = Number(batch.originalPrice) || 0;
  const discountPrice = Number(batch.discountPrice) || 0;

  const discount =
    !batch.isFree && originalPrice > 0
      ? Math.round(((originalPrice - discountPrice) / originalPrice) * 100)
      : 0;

  const teachers = batch.teachers ?? [];
  const features = batch.features ?? [];

  const status = batch.status;

  const statusLabel = statusLabels[status] ?? status;

  const statusClass =
    statusStyles[status] ?? "border-border bg-muted text-muted-foreground";

  const hasExpiryDate = Boolean(batch.expiryDate);
  const hasValidity = batch.validityMonths != null;

  const validityLabel = `${batch.validityMonths} Months`;

  // --------------------------------------------------
  // Render
  // --------------------------------------------------

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 md:p-6">
      {/* Back Navigation */}

      <Button variant="ghost" className="-ml-3" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 size-4" />
        Back to batches
      </Button>

      {/* Main Layout */}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Main Content */}

        <div className="space-y-6 lg:col-span-2">
          {/* Thumbnail with Medium and Status */}

          <div className="relative overflow-hidden rounded-xl border bg-muted">
            {batch.thumbnail ? (
              <img
                src={batch.thumbnail}
                alt={batch.title}
                className="aspect-video w-full object-cover"
              />
            ) : (
              <div className="flex aspect-video items-center justify-center">
                <GraduationCap className="size-16 text-muted-foreground" />
              </div>
            )}

            {/* Medium Badge */}

            {batch.medium && (
              <Badge className="absolute left-3 top-3 border border-border/50 bg-background/95 px-3 py-1 capitalize text-foreground shadow-sm backdrop-blur">
                {batch.medium.toLowerCase()}
              </Badge>
            )}

            {/* Status Badge */}

            <Badge
              variant="outline"
              className={`absolute right-3 top-3 border px-3 py-1 font-semibold shadow-sm ${statusClass}`}
            >
              {statusLabel}
            </Badge>
          </div>

          {/* Batch Information */}

          <section className="space-y-4">
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {batch.title}
            </h1>

            <p className="whitespace-pre-line leading-7 text-muted-foreground">
              {batch.description || "No description available."}
            </p>
          </section>

          <Separator />

          {/* Features */}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">What you'll get</h2>

            {features.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {features.map((feature, index) => (
                  <div
                    key={`${feature}-${index}`}
                    className="flex items-start gap-2"
                  >
                    <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" />

                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No features available.
              </p>
            )}
          </section>

          <Separator />

          {/* Batch Schedule */}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">Batch Schedule</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              {/* Start Date */}

              <div className="flex items-center gap-3 rounded-lg border p-4">
                <CalendarDays className="size-5 shrink-0 text-primary" />

                <div>
                  <p className="text-xs text-muted-foreground">Start Date</p>

                  <p className="font-medium">{formatDate(batch.startDate)}</p>
                </div>
              </div>

              {/* Expiry Date OR Validity */}

              {hasExpiryDate ? (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <CalendarCheck className="size-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>

                    <p className="font-medium">
                      {formatDate(batch.expiryDate)}
                    </p>
                  </div>
                </div>
              ) : hasValidity ? (
                <div className="flex items-center gap-3 rounded-lg border p-4">
                  <Clock className="size-5 shrink-0 text-primary" />

                  <div>
                    <p className="text-xs text-muted-foreground">Validity</p>

                    <p className="font-medium">{validityLabel}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <Separator />

          {/* Teachers */}

          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xl font-semibold">Meet Your Teachers</h2>

              <Badge variant="secondary">{teachers.length} Teachers</Badge>
            </div>

            {teachers.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {teachers.map(({ teacher, teacherId }) => (
                  <div
                    key={teacherId}
                    className="flex gap-3 rounded-xl border p-4"
                  >
                    <Avatar className="size-12">
                      <AvatarImage
                        src={teacher.user.image ?? undefined}
                        alt={teacher.user.name}
                      />

                      <AvatarFallback>
                        {teacher.user.name
                          .split(" ")
                          .map((part) => part[0])
                          .join("")
                          .slice(0, 2)
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold">
                        {teacher.user.name}
                      </h3>

                      <p className="text-sm text-primary">{teacher.subject}</p>

                      <p className="text-xs text-muted-foreground">
                        {teacher.experienceYears} years experience
                      </p>

                      {teacher.qualification && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {teacher.qualification}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Teacher information is not available.
              </p>
            )}
          </section>
        </div>

        {/* Enrollment Sidebar */}

        <aside>
          <div className="space-y-5 rounded-xl border bg-card p-5 lg:sticky lg:top-6">
            {/* Pricing */}

            <div>
              <p className="text-sm text-muted-foreground">Batch Fee</p>

              {batch.isFree ? (
                <p className="mt-1 text-3xl font-bold text-green-600">FREE</p>
              ) : (
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <span className="text-3xl font-bold">
                    ₹{formatPrice(batch.discountPrice)}
                  </span>

                  {originalPrice > discountPrice && (
                    <span className="text-sm text-muted-foreground line-through">
                      ₹{formatPrice(batch.originalPrice)}
                    </span>
                  )}

                  {discount > 0 && (
                    <Badge variant="secondary">{discount}% OFF</Badge>
                  )}
                </div>
              )}
            </div>

            <Separator />

            {/* Batch Information */}

            <div className="space-y-4">
              {/* Medium */}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Medium</p>

                  <p className="text-sm font-medium capitalize">
                    {batch.medium || "Not specified"}
                  </p>
                </div>
              </div>

              {/* Status */}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>

                  <Badge variant="outline" className={`mt-1 ${statusClass}`}>
                    {statusLabel}
                  </Badge>
                </div>
              </div>

              {/* Teachers */}

              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">Teachers</p>

                  <p className="text-sm font-medium">
                    {teachers.length} Teachers
                  </p>
                </div>
              </div>

              {/* Expiry Date OR Validity */}

              {hasExpiryDate ? (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Expiry Date</p>

                    <p className="text-sm font-medium">
                      {formatDate(batch.expiryDate)}
                    </p>
                  </div>
                </div>
              ) : hasValidity ? (
                <div className="flex items-center gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Validity</p>

                    <p className="text-sm font-medium">{validityLabel}</p>
                  </div>
                </div>
              ) : null}
            </div>

            <Separator />

            {/* Enrollment Button */}

            <Button
              className="w-full"
              size="lg"
              disabled={batch.status === "COMPLETED"}
              onClick={() => {
                console.log("Enroll in batch:", batch.id);
              }}
            >
              {batch.status === "COMPLETED"
                ? "Enrollment Closed"
                : "Enroll Now"}
            </Button>

            <p className="text-center text-xs text-muted-foreground">
              Secure enrollment and payment.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

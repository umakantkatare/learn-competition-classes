"use client";

import React from "react";
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  Globe,
  GraduationCap,
  Hash,
  Layers,
  Pencil,
  PlayCircle,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";

import type { Batch } from "@/hooks/academic/use-batches";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// --------------------------------------------------
// Props
// --------------------------------------------------

interface BatchDetailsProps {
  batch: Batch;
  onBack?: () => void;
  onEdit?: (batch: Batch) => void;
}

// --------------------------------------------------
// Helpers
// --------------------------------------------------

function formatDate(date?: string | Date | null): string {
  if (!date) return "—";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function formatPrice(price?: string | number | null): string {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const amount = Number(price);

  if (!Number.isFinite(amount)) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

// --------------------------------------------------
// Reusable Components
// --------------------------------------------------

function SectionHeading({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="size-4" />
      </div>

      <div className="space-y-1">
        <h3 className="text-base font-semibold tracking-tight">{title}</h3>

        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) {
  return (
    <div className="min-w-0 space-y-2">
      <p className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3.5" />}
        {label}
      </p>

      <div className="break-words text-sm font-semibold">{value || "—"}</div>
    </div>
  );
}

function StatusBadge({ status }: { status: Batch["status"] }) {
  const styles: Record<Batch["status"], string> = {
    UPCOMING:
      "border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400",
    ONGOING:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    COMPLETED: "border-muted-foreground/30 bg-muted text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={styles[status]}>
      {status}
    </Badge>
  );
}

function PublicationBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <Badge
      variant="outline"
      className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
    >
      <CheckCircle2 className="mr-1 size-3" />
      Published
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Draft
    </Badge>
  );
}

// --------------------------------------------------
// Main Component
// --------------------------------------------------

export default function BatchDetails({
  batch,
  onBack,
  onEdit,
}: BatchDetailsProps) {
  const teachers = batch.teachers ?? [];
  const features = batch.features ?? [];

  const displayPrice = batch.isFree ? "Free" : formatPrice(batch.discountPrice);

  const duration =
    batch.validityMonths != null
      ? `${batch.validityMonths} Months`
      : "Not configured";

  // Show only one: explicit expiry date takes priority.
  const hasExpiryDate = Boolean(batch.expiryDate);
  const hasValidity = batch.validityMonths != null;

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 pb-10">
      {/* ------------------------------------------- */}
      {/* Header */}
      {/* ------------------------------------------- */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          {onBack && (
            <Button
              variant="outline"
              size="icon"
              onClick={onBack}
              aria-label="Go back"
            >
              <ArrowLeft className="size-4" />
            </Button>
          )}

          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Batch Details
            </h1>

            <p className="text-sm text-muted-foreground">
              Manage and review your batch information.
            </p>
          </div>
        </div>

        {onEdit && (
          <Button onClick={() => onEdit(batch)} className="w-full sm:w-auto">
            <Pencil className="mr-2 size-4" />
            Edit Batch
          </Button>
        )}
      </div>

      {/* ------------------------------------------- */}
      {/* Batch Overview */}
      {/* ------------------------------------------- */}

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        {/* Thumbnail */}

        <Card className="overflow-hidden">
          <div className="relative aspect-video overflow-hidden bg-muted sm:aspect-[16/7] lg:aspect-auto lg:min-h-[320px]">
            {batch.thumbnail ? (
              <img
                src={batch.thumbnail}
                alt={batch.title}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full min-h-64 items-center justify-center">
                <Layers className="size-16 text-muted-foreground/30" />
              </div>
            )}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-16 sm:p-6 sm:pt-20">
              <div className="mb-3 flex flex-wrap gap-2">
                <StatusBadge status={batch.status} />
                <PublicationBadge isPublished={batch.isPublished} />
              </div>

              <h2 className="text-xl font-bold text-white sm:text-2xl">
                {batch.title}
              </h2>

              <p className="mt-1 text-xs text-white/70">{batch.slug}</p>
            </div>
          </div>
        </Card>

        {/* Pricing Summary */}

        <Card className="flex flex-col">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{batch.medium}</Badge>

              <Globe className="size-4 text-muted-foreground" />
            </div>

            <div className="space-y-2">
              <CardTitle className="text-lg leading-snug">
                {batch.title}
              </CardTitle>

              <CardDescription>
                Batch pricing and enrollment information.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="flex flex-1 flex-col space-y-5">
            <Separator />

            {/* Pricing */}

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {batch.isFree ? "Enrollment Price" : "Discounted Price"}
              </p>

              <div className="flex flex-wrap items-baseline gap-2">
                <span className="text-3xl font-bold tracking-tight">
                  {displayPrice}
                </span>

                {!batch.isFree && (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatPrice(batch.originalPrice)}
                  </span>
                )}
              </div>

              {batch.isFree && <Badge variant="secondary">Free Batch</Badge>}
            </div>

            <Separator />

            {/* Batch Information */}

            <div className="space-y-4">
              <DetailItem
                label="Start Date"
                icon={CalendarDays}
                value={formatDate(batch.startDate)}
              />

              {/* Expiry Date OR Validity */}

              {hasExpiryDate ? (
                <DetailItem
                  label="Expiry Date"
                  icon={CalendarCheck}
                  value={formatDate(batch.expiryDate)}
                />
              ) : hasValidity ? (
                <DetailItem label="Validity" icon={Clock} value={duration} />
              ) : null}

              <DetailItem
                label="Assigned Teachers"
                icon={Users}
                value={`${teachers.length} Teachers`}
              />
            </div>

            {/* Publication Information */}

            <div className="mt-auto rounded-lg border bg-muted/40 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ShieldCheck className="size-4 text-primary" />
                Publication Status
              </div>

              <p className="mt-1 text-xs text-muted-foreground">
                {batch.isPublished
                  ? "This batch is published and available according to its visibility settings."
                  : "This batch is currently saved as a draft."}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------- */}
      {/* Description */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-4 p-5 sm:p-6">
          <SectionHeading
            icon={BookOpen}
            title="About This Batch"
            description="Batch overview and course description."
          />

          <Separator />

          <div className="whitespace-pre-line text-sm leading-7 text-muted-foreground">
            {batch.description || "No description available."}
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------- */}
      {/* Features */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            icon={CheckCircle2}
            title="Batch Features"
            description="Features and benefits included in this batch."
          />

          <Separator />

          {features.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {features.map((feature, index) => (
                <div
                  key={`${feature}-${index}`}
                  className="flex items-start gap-3 rounded-lg border bg-muted/20 p-3 transition-colors hover:bg-muted/50"
                >
                  <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <CheckCircle2 className="size-4 text-primary" />
                  </div>

                  <p className="pt-1 text-sm font-medium leading-relaxed">
                    {feature}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="py-5 text-center text-sm text-muted-foreground">
              No features added to this batch.
            </p>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------- */}
      {/* Schedule & Validity */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            icon={CalendarDays}
            title="Schedule & Validity"
            description="Batch timeline and validity configuration."
          />

          <Separator />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Start Date"
              icon={CalendarDays}
              value={formatDate(batch.startDate)}
            />

            {/* Expiry Date OR Validity */}

            {hasExpiryDate ? (
              <DetailItem
                label="Expiry Date"
                icon={CalendarCheck}
                value={formatDate(batch.expiryDate)}
              />
            ) : hasValidity ? (
              <DetailItem
                label="Validity Period"
                icon={Clock}
                value={duration}
              />
            ) : null}

            <DetailItem
              label="Batch Status"
              value={<StatusBadge status={batch.status} />}
            />

            <DetailItem label="Medium" icon={Globe} value={batch.medium} />

            <DetailItem
              label="Publication"
              value={<PublicationBadge isPublished={batch.isPublished} />}
            />
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------- */}
      {/* Assigned Teachers */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SectionHeading
              icon={GraduationCap}
              title="Assigned Teachers"
              description="Teachers assigned to this batch."
            />

            <Badge variant="secondary">{teachers.length} Teachers</Badge>
          </div>

          <Separator />

          {teachers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {teachers.map((item) => {
                const teacher = item.teacher;
                const user = teacher?.user;

                if (!teacher) return null;

                return (
                  <div
                    key={teacher.id}
                    className="flex min-w-0 gap-3 rounded-xl border bg-muted/20 p-4 transition-colors hover:bg-muted/50"
                  >
                    {user?.image ? (
                      <img
                        src={user.image}
                        alt={user.name}
                        className="size-12 shrink-0 rounded-full border object-cover"
                      />
                    ) : (
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <GraduationCap className="size-6 text-primary" />
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <p className="truncate text-sm font-semibold">
                          {user?.name || "Unknown Teacher"}
                        </p>

                        <p className="truncate text-xs text-muted-foreground">
                          {user?.email || "—"}
                        </p>
                      </div>

                      <Badge variant="secondary">
                        {teacher.subject || "Subject not specified"}
                      </Badge>

                      <div className="space-y-1 text-xs text-muted-foreground">
                        <p>{teacher.experienceYears ?? 0} years experience</p>

                        {teacher.qualification && (
                          <p className="line-clamp-2">
                            {teacher.qualification}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <Users className="mb-3 size-10 text-muted-foreground/40" />

              <p className="text-sm font-medium">No teachers assigned</p>

              <p className="mt-1 text-xs text-muted-foreground">
                Teachers assigned to this batch will appear here.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------- */}
      {/* Batch Media */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            icon={Video}
            title="Batch Media"
            description="Batch thumbnail and promotional preview."
          />

          <Separator />

          <div className="grid gap-5 md:grid-cols-2">
            {/* Thumbnail */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Thumbnail</h4>

                <Badge variant="outline">Image</Badge>
              </div>

              {batch.thumbnail ? (
                <img
                  src={batch.thumbnail}
                  alt={`${batch.title} thumbnail`}
                  className="aspect-video w-full rounded-xl border bg-muted object-cover"
                />
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-xl border bg-muted">
                  <Layers className="size-12 text-muted-foreground/30" />
                </div>
              )}
            </div>

            {/* Preview Video */}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold">Preview Video</h4>

                <Badge variant="outline">Video</Badge>
              </div>

              {batch.previewVideo ? (
                <div className="overflow-hidden rounded-xl border bg-black">
                  <video
                    src={batch.previewVideo}
                    controls
                    preload="metadata"
                    className="aspect-video w-full"
                  />
                </div>
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-xl border bg-muted">
                  <PlayCircle className="size-10 text-muted-foreground/30" />

                  <p className="text-xs text-muted-foreground">
                    No preview video available
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ------------------------------------------- */}
      {/* Additional Information */}
      {/* ------------------------------------------- */}

      <Card>
        <CardContent className="space-y-5 p-5 sm:p-6">
          <SectionHeading
            icon={Hash}
            title="Additional Information"
            description="Batch identification and audit information."
          />

          <Separator />

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <DetailItem
              label="Batch ID"
              icon={Hash}
              value={<span className="font-mono text-xs">{batch.id}</span>}
            />

            <DetailItem
              label="Examination ID"
              icon={BookOpen}
              value={
                <span className="font-mono text-xs">{batch.examinationId}</span>
              }
            />

            <DetailItem label="Medium" icon={Globe} value={batch.medium} />

            <DetailItem
              label="Created At"
              icon={CalendarDays}
              value={formatDate(batch.createdAt)}
            />

            <DetailItem
              label="Last Updated"
              icon={Clock}
              value={formatDate(batch.updatedAt)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

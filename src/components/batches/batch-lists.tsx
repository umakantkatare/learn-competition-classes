
"use client";

import { useMemo, useState } from "react";

import {
  Search,
  MoreHorizontal,
  Pencil,
  Layers,
  RefreshCw,
  AlertTriangle,
  CalendarDays,
  GraduationCap,
  CheckCircle2,
} from "lucide-react";

import {
  useGetAllBatches,
  type Batch,
} from "@/hooks/academic/use-batches";

import BatchForm from "./batch-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

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

function getTeacherNames(batch: Batch): string[] {
  return (
    batch.teachers
      ?.map((item) => item.teacher?.user?.name)
      .filter((name): name is string => Boolean(name)) ?? []
  );
}

/**
 * Calculates the display expiry date for validity-based batches.
 *
 * This is only for display. The calculated date is not persisted
 * in the database when validityMonths is used.
 */
function getBatchExpiryDate(batch: Batch): Date | null {
  if (batch.expiryDate) {
    const expiryDate = new Date(batch.expiryDate);

    return Number.isNaN(expiryDate.getTime())
      ? null
      : expiryDate;
  }

  if (
    batch.validityMonths === null ||
    batch.validityMonths === undefined
  ) {
    return null;
  }

  const startDate = new Date(batch.startDate);

  if (Number.isNaN(startDate.getTime())) return null;

  // Avoid JavaScript month overflow, e.g. January 31 + 1 month.
  const day = startDate.getDate();

  const expiryDate = new Date(startDate);
  expiryDate.setDate(1);
  expiryDate.setMonth(
    expiryDate.getMonth() + batch.validityMonths,
  );

  const lastDayOfTargetMonth = new Date(
    expiryDate.getFullYear(),
    expiryDate.getMonth() + 1,
    0,
  ).getDate();

  expiryDate.setDate(Math.min(day, lastDayOfTargetMonth));

  return expiryDate;
}

function getBatchDurationLabel(batch: Batch): string {
  if (batch.expiryDate) {
    return "Fixed expiry";
  }

  if (batch.validityMonths !== null && batch.validityMonths !== undefined) {
    return `${batch.validityMonths} months validity`;
  }

  return "Not configured";
}

// -----------------------------------------------------------------------------
// Loading Skeleton
// -----------------------------------------------------------------------------

function BatchListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Loading batches"
      aria-busy="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-16 w-full rounded-md"
        />
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Empty State
// -----------------------------------------------------------------------------

function BatchEmptyState({
  isSearching,
}: {
  isSearching: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Layers className="size-7 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          {isSearching
            ? "No matching batches"
            : "No batches yet"}
        </h3>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different batch title, slug, feature, teacher or status."
            : "Batches will appear here when they are created."}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Error State
// -----------------------------------------------------------------------------

function BatchErrorState({
  onRetry,
  isFetching,
  message,
}: {
  onRetry: () => void;
  isFetching: boolean;
  message: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-7 text-destructive" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          Failed to load batches
        </h3>

        <p className="text-sm text-muted-foreground">
          {message}
        </p>
      </div>

      <Button
        variant="outline"
        onClick={onRetry}
        disabled={isFetching}
      >
        <RefreshCw
          className={`mr-2 size-4 ${
            isFetching ? "animate-spin" : ""
          }`}
        />

        {isFetching ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Batch Status Badge
// -----------------------------------------------------------------------------

function BatchStatusBadge({
  status,
}: {
  status: Batch["status"];
}) {
  const variants: Record<
    string,
    { label: string; className: string }
  > = {
    UPCOMING: {
      label: "Upcoming",
      className: "border-blue-500/30 text-blue-600",
    },
    ONGOING: {
      label: "Ongoing",
      className: "border-emerald-500/30 text-emerald-600",
    },
    COMPLETED: {
      label: "Completed",
      className:
        "border-muted-foreground/30 text-muted-foreground",
    },
    EXPIRED: {
      label: "Expired",
      className: "border-destructive/30 text-destructive",
    },
  };

  const config = variants[status] ?? {
    label: status ?? "Unknown",
    className: "border-border text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

// -----------------------------------------------------------------------------
// Publication Badge
// -----------------------------------------------------------------------------

function PublicationBadge({
  isPublished,
}: {
  isPublished: boolean;
}) {
  return isPublished ? (
    <Badge
      variant="outline"
      className="border-emerald-500/30 text-emerald-600"
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

// -----------------------------------------------------------------------------
// Batch Features
// -----------------------------------------------------------------------------

function BatchFeatures({
  features,
}: {
  features?: string[];
}) {
  if (!features?.length) {
    return (
      <p className="text-xs text-muted-foreground">
        No features added
      </p>
    );
  }

  const visibleFeatures = features.slice(0, 2);
  const remainingCount = features.length - visibleFeatures.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleFeatures.map((feature, index) => (
        <Badge
          key={`${feature}-${index}`}
          variant="secondary"
          className="max-w-32 truncate text-xs font-normal"
        >
          {feature}
        </Badge>
      ))}

      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          +{remainingCount}
        </Badge>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Batch List Component
// -----------------------------------------------------------------------------

export default function BatchList() {
  // Fetch batches
  const {
    data: batches,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllBatches();

  // Local states
  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] =
    useState<Batch | null>(null);

  // ---------------------------------------------------------------------------
  // Search and Filter
  // ---------------------------------------------------------------------------

  const filteredBatches = useMemo(() => {
    const list = batches ?? [];
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((batch) => {
      const teacherNames = getTeacherNames(batch).join(" ");

      const searchableValues = [
        batch.title,
        batch.slug,
        batch.description,
        batch.status,
        batch.medium,
        batch.examinationId,
        teacherNames,
        ...(batch.features ?? []),
        batch.isPublished ? "published" : "draft",
        batch.isFree ? "free" : "paid",
        getBatchDurationLabel(batch),
      ];

      return searchableValues.some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      );
    });
  }, [batches, search]);

  // ---------------------------------------------------------------------------
  // Refresh
  // ---------------------------------------------------------------------------

  function handleRefresh() {
    void refetch();
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <>
      <Card className="rounded-card border-border/70 bg-card shadow-sm">
        {/* Header */}

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Layers className="size-5 text-primary" />
              </div>

              Batches
            </CardTitle>

            <CardDescription>
              Manage batches, features, pricing, teachers,
              schedules and publication.
            </CardDescription>
          </div>

          {/* Search */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search batches..."
              className="h-10 rounded-input bg-background pl-9"
              aria-label="Search batches"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <BatchListSkeleton />
          ) : isError ? (
            <BatchErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching batches."
              }
              onRetry={handleRefresh}
              isFetching={isFetching}
            />
          ) : (
            <>
              {/* Toolbar */}

              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full px-3 py-1"
                  >
                    {filteredBatches.length}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {filteredBatches.length === 1
                      ? "Batch found"
                      : "Batches found"}
                  </span>

                  {isFetching && (
                    <span className="text-xs text-muted-foreground">
                      Updating...
                    </span>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={isFetching}
                  onClick={handleRefresh}
                  className="w-fit rounded-button"
                >
                  <RefreshCw
                    className={`mr-2 size-4 ${
                      isFetching ? "animate-spin" : ""
                    }`}
                  />
                  Refresh
                </Button>
              </div>

              {/* Empty State / Table */}

              {filteredBatches.length === 0 ? (
                <BatchEmptyState
                  isSearching={Boolean(search.trim())}
                />
              ) : (
                <div className="relative max-h-[600px] w-full max-w-full overflow-auto rounded-section border border-border">
                  <Table className="min-w-[1350px] w-full">
                    {/* Table Header */}

                    <TableHeader className="sticky top-0 z-10 bg-muted shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-64 font-semibold">
                          Batch
                        </TableHead>

                        <TableHead className="min-w-40 font-semibold">
                          Features
                        </TableHead>

                        <TableHead className="min-w-40 font-semibold">
                          Teachers
                        </TableHead>

                        <TableHead className="min-w-32 font-semibold">
                          Pricing
                        </TableHead>

                        <TableHead className="min-w-40 font-semibold">
                          Duration
                        </TableHead>

                        <TableHead className="min-w-28 font-semibold">
                          Medium
                        </TableHead>

                        <TableHead className="min-w-28 font-semibold">
                          Status
                        </TableHead>

                        <TableHead className="min-w-28 font-semibold">
                          Visibility
                        </TableHead>

                        <TableHead className="w-16 text-right font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}

                    <TableBody>
                      {filteredBatches.map((batch) => {
                        const teacherNames = getTeacherNames(batch);
                        const expiryDate = getBatchExpiryDate(batch);

                        return (
                          <TableRow
                            key={batch.id}
                            className="transition-colors hover:bg-accent/40"
                          >
                            {/* Batch Information */}

                            <TableCell>
                              <div className="flex items-center gap-3">
                                {batch.thumbnail ? (
                                  <img
                                    src={batch.thumbnail}
                                    alt={batch.title}
                                    className="size-11 shrink-0 rounded-md border object-cover"
                                    loading="lazy"
                                  />
                                ) : (
                                  <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                                    <Layers className="size-5" />
                                  </div>
                                )}

                                <div className="min-w-0 space-y-1">
                                  <p className="max-w-52 truncate font-medium text-foreground">
                                    {batch.title || "Untitled Batch"}
                                  </p>

                                  <p className="max-w-52 truncate font-mono text-xs text-muted-foreground">
                                    {batch.slug || "—"}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Features */}

                            <TableCell>
                              <BatchFeatures features={batch.features} />
                            </TableCell>

                            {/* Teachers */}

                            <TableCell>
                              <div className="flex items-start gap-2">
                                <GraduationCap className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="space-y-1">
                                  {teacherNames.length > 0 ? (
                                    <>
                                      {teacherNames
                                        .slice(0, 2)
                                        .map((name, index) => (
                                          <p
                                            key={`${batch.id}-${index}`}
                                            className="text-sm font-medium"
                                          >
                                            {name}
                                          </p>
                                        ))}

                                      {teacherNames.length > 2 && (
                                        <p className="text-xs text-muted-foreground">
                                          +{teacherNames.length - 2} more
                                        </p>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      Not assigned
                                    </span>
                                  )}

                                  <p className="text-xs text-muted-foreground">
                                    {batch.teachers?.length ?? 0} teacher(s)
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Pricing */}

                            <TableCell>
                              {batch.isFree ? (
                                <Badge variant="secondary">
                                  Free
                                </Badge>
                              ) : (
                                <div className="space-y-1">
                                  <p className="font-semibold text-foreground">
                                    {formatPrice(batch.discountPrice)}
                                  </p>

                                  <p className="text-xs text-muted-foreground line-through">
                                    {formatPrice(batch.originalPrice)}
                                  </p>
                                </div>
                              )}
                            </TableCell>

                            {/* Duration */}

                            <TableCell>
                              <div className="flex items-start gap-2">
                                <CalendarDays className="mt-0.5 size-4 shrink-0 text-muted-foreground" />

                                <div className="space-y-1 text-xs">
                                  <p>
                                    <span className="text-muted-foreground">
                                      Start:{" "}
                                    </span>
                                    {formatDate(batch.startDate)}
                                  </p>

                                  <p>
                                    <span className="text-muted-foreground">
                                      End:{" "}
                                    </span>
                                    {formatDate(expiryDate)}
                                  </p>

                                  <p className="text-muted-foreground">
                                    {getBatchDurationLabel(batch)}
                                  </p>
                                </div>
                              </div>
                            </TableCell>

                            {/* Medium */}

                            <TableCell>
                              <Badge variant="secondary">
                                {batch.medium || "—"}
                              </Badge>
                            </TableCell>

                            {/* Lifecycle Status */}

                            <TableCell>
                              <BatchStatusBadge status={batch.status} />
                            </TableCell>

                            {/* Publication */}

                            <TableCell>
                              <PublicationBadge
                                isPublished={batch.isPublished}
                              />
                            </TableCell>

                            {/* Actions */}

                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      aria-label={`Actions for ${batch.title}`}
                                    >
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  }
                                />

                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setSelectedBatch(batch)
                                    }
                                  >
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Batch Dialog */}

      {selectedBatch && (
        <BatchForm
          key={selectedBatch.id}
          open={Boolean(selectedBatch)}
          hideTrigger
          initialData={selectedBatch}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedBatch(null);
            }
          }}
          onSuccessCallback={() => {
            setSelectedBatch(null);
          }}
        />
      )}
    </>
  );
}

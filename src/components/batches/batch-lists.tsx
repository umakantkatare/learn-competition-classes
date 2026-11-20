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
  CheckCircle2,
} from "lucide-react";

import { useGetAllBatches, type Batch } from "@/hooks/academic/use-batches";

import BatchForm from "./batch-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/* -------------------------------------------------------------------------- */
/* Formatters                                                                 */
/* -------------------------------------------------------------------------- */

const dateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const priceFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(date?: string | Date | null): string {
  if (!date) return "—";

  const parsedDate = new Date(date);

  return Number.isNaN(parsedDate.getTime())
    ? "—"
    : dateFormatter.format(parsedDate);
}

function formatPrice(price?: string | number | null): string {
  if (price === null || price === undefined || price === "") {
    return "—";
  }

  const amount = Number(price);

  return Number.isFinite(amount) ? priceFormatter.format(amount) : "—";
}

function hasValue(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

function getTeacherNames(batch: Batch): string[] {
  return (
    batch.teachers
      ?.map((item) => item.teacher?.user?.name)
      .filter((name): name is string => Boolean(name)) ?? []
  );
}

function getBatchSearchText(batch: Batch): string {
  return [
    batch.title,
    batch.slug,
    batch.description,
    batch.status,
    batch.medium,
    batch.examinationId,
    ...getTeacherNames(batch),
    ...(batch.features ?? []),
    batch.isPublished ? "published" : "draft",
    batch.isFree ? "free" : "paid",
    batch.expiryDate,
    batch.validityMonths,
  ]
    .filter((value) => value !== null && value !== undefined)
    .map((value) => String(value).toLowerCase())
    .join(" ");
}

/* -------------------------------------------------------------------------- */
/* Loading State                                                              */
/* -------------------------------------------------------------------------- */

function BatchListSkeleton() {
  return (
    <div
      className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="Loading batches"
      aria-busy="true"
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="space-y-3 rounded-lg border p-4">
          <Skeleton className="aspect-video w-full rounded-md" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-full" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

function BatchEmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-foreground">
          {isSearching ? "No matching batches" : "No batches yet"}
        </h2>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different batch title, slug, feature, teacher or status."
            : "Batches will appear here when they are created."}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Error State                                                                */
/* -------------------------------------------------------------------------- */

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

        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Button variant="outline" onClick={onRetry} disabled={isFetching}>
        <RefreshCw
          className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
        />
        {isFetching ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badges                                                              */
/* -------------------------------------------------------------------------- */

const batchStatusVariants: Record<
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
    className: "border-muted-foreground/30 text-muted-foreground",
  },
  EXPIRED: {
    label: "Expired",
    className: "border-destructive/30 text-destructive",
  },
};

function BatchStatusBadge({ status }: { status: Batch["status"] }) {
  const config = batchStatusVariants[status] ?? {
    label: status ?? "Unknown",
    className: "border-border text-muted-foreground",
  };

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
}

function PublicationBadge({ isPublished }: { isPublished: boolean }) {
  return isPublished ? (
    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600">
      <CheckCircle2 className="mr-1 size-3" />
      Published
    </Badge>
  ) : (
    <Badge variant="outline" className="text-muted-foreground">
      Draft
    </Badge>
  );
}

/* -------------------------------------------------------------------------- */
/* Features                                                                   */
/* -------------------------------------------------------------------------- */

function BatchFeatures({ features }: { features?: string[] }) {
  if (!features?.length) {
    return <p className="text-xs text-muted-foreground">No features added</p>;
  }

  const visibleFeatures = features.slice(0, 3);
  const remainingCount = features.length - visibleFeatures.length;

  return (
    <div className="flex flex-wrap items-center gap-1">
      {visibleFeatures.map((feature, index) => (
        <Badge
          key={`${feature}-${index}`}
          variant="secondary"
          className="min-w-0 max-w-32 text-xs font-normal"
        >
          <span className="block min-w-0 max-w-full truncate" title={feature}>
            {feature}
          </span>
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

/* -------------------------------------------------------------------------- */
/* Batch Card                                                                 */
/* -------------------------------------------------------------------------- */

function BatchCard({
  batch,
  onEdit,
}: {
  batch: Batch;
  onEdit: (batch: Batch) => void;
}) {
  return (
    <Card className="group flex h-full flex-col overflow-hidden rounded-card border-border/70 bg-card pt-0 shadow-sm transition-shadow hover:shadow-md">
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-primary/10">
        {batch.thumbnail ? (
          <img
            src={batch.thumbnail}
            alt={batch.title}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center text-primary">
            <Layers className="size-10" />
          </div>
        )}

        {/* Status Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
          <span className="rounded-md bg-background/90 backdrop-blur">
            <BatchStatusBadge status={batch.status} />
          </span>

          <span className="rounded-md bg-background/90 backdrop-blur">
            <PublicationBadge isPublished={batch.isPublished} />
          </span>
        </div>

        {/* Single Edit Action */}
        <div className="absolute right-2 top-2">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 bg-background/90 backdrop-blur"
                  aria-label={`Actions for ${batch.title}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              }
            />

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(batch)}>
                <Pencil className="mr-2 size-4" />
                Edit
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Title + Price */}
      <CardHeader className="gap-3 px-4 pt-4 pb-3">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0 space-y-1">
            <CardTitle
              className="truncate text-base font-semibold"
              title={batch.title}
            >
              {batch.title || "Untitled Batch"}
            </CardTitle>

            <p
              className="truncate font-mono text-xs text-muted-foreground"
              title={batch.slug}
            >
              {batch.slug || "—"}
            </p>
          </div>

          <div className="min-w-[88px] shrink-0 text-right">
            {batch.isFree ||
            (batch.discountPrice !== null &&
              batch.discountPrice !== undefined &&
              batch.discountPrice !== "" &&
              Number(batch.discountPrice) === 0) ? (
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-600"
              >
                Free
              </Badge>
            ) : (
              <>
                <p className="whitespace-nowrap text-sm font-bold leading-5 text-foreground">
                  {formatPrice(batch.discountPrice)}
                </p>

                <p className="whitespace-nowrap text-xs leading-5 text-muted-foreground line-through">
                  {formatPrice(batch.originalPrice)}
                </p>
              </>
            )}
          </div>
        </div>
      </CardHeader>

      {/* Details */}
      <CardContent className="flex-1 space-y-5 px-4 pb-5">
        <BatchFeatures features={batch.features} />

        {/* Teachers */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Teachers</span>

            <span className="text-xs text-muted-foreground">
              {batch.teachers?.length ?? 0} assigned
            </span>
          </div>

          {batch.teachers?.length ? (
            <div className="grid grid-cols-2 gap-2">
              {batch.teachers.map((item, index) => {
                const teacher = item.teacher;
                const name = teacher?.user?.name?.trim() || "Unknown Teacher";
                const image = teacher?.user?.image;

                const initials = name
                  .split(/\s+/)
                  .slice(0, 2)
                  .map((part) => part.charAt(0).toUpperCase())
                  .join("");

                return (
                  <div
                    key={teacher?.id ?? index}
                    className="flex min-w-0 items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2.5 py-2"
                  >
                    <div className="flex size-7 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {image ? (
                        <img
                          src={image}
                          alt={name}
                          className="size-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        initials || "T"
                      )}
                    </div>

                    <span
                      className="truncate text-xs font-medium text-foreground"
                      title={name}
                    >
                      {name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="rounded-md border border-dashed p-3 text-center text-xs text-muted-foreground">
              No teachers assigned
            </p>
          )}
        </div>

        {/* Batch Dates & Validity */}
        {(hasValue(batch.startDate) ||
          hasValue(batch.expiryDate) ||
          hasValue(batch.validityMonths)) && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {hasValue(batch.startDate) && (
              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2">
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    Start Date
                  </p>
                  <p className="truncate text-xs font-medium">
                    {formatDate(batch.startDate)}
                  </p>
                </div>
              </div>
            )}

            {hasValue(batch.expiryDate) && (
              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2">
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">
                    Expiry Date
                  </p>
                  <p className="truncate text-xs font-medium">
                    {formatDate(batch.expiryDate)}
                  </p>
                </div>
              </div>
            )}

            {hasValue(batch.validityMonths) && (
              <div className="flex items-center gap-2 rounded-md bg-muted/40 px-2.5 py-2">
                <CalendarDays className="size-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="text-[10px] text-muted-foreground">Validity</p>
                  <p className="truncate text-xs font-medium">
                    {batch.validityMonths} Months
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Footer: Medium only (No duplicate Edit button) */}
      <CardFooter className="mt-auto border-t px-4 py-3">
        <Badge variant="secondary">{batch.medium || "—"}</Badge>
      </CardFooter>
    </Card>
  );
}

/* -------------------------------------------------------------------------- */
/* Batch List                                                                 */
/* -------------------------------------------------------------------------- */

export default function BatchList() {
  const {
    data: batches,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllBatches();

  const [search, setSearch] = useState("");
  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null);

  const normalizedQuery = search.trim().toLowerCase();

  const searchableBatches = useMemo(
    () =>
      (batches ?? []).map((batch) => ({
        batch,
        searchText: getBatchSearchText(batch),
      })),
    [batches],
  );

  const filteredBatches = useMemo(() => {
    if (!normalizedQuery) {
      return searchableBatches.map(({ batch }) => batch);
    }

    return searchableBatches
      .filter(({ searchText }) => searchText.includes(normalizedQuery))
      .map(({ batch }) => batch);
  }, [normalizedQuery, searchableBatches]);

  function handleRefresh() {
    void refetch();
  }

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
              Manage batches, features, pricing, teachers, schedules and
              publication.
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
                  <Badge variant="secondary" className="rounded-full px-3 py-1">
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

              {/* Batch Cards */}
              {filteredBatches.length === 0 ? (
                <BatchEmptyState isSearching={Boolean(normalizedQuery)} />
              ) : (
                <div className="mb-7 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredBatches.map((batch) => (
                    <BatchCard
                      key={batch.id}
                      batch={batch}
                      onEdit={setSelectedBatch}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Edit Batch Form */}
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

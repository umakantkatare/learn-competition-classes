"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Ban,
  Tags,
  RefreshCw,
  ImageIcon,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetExamCategories,
  useDeactivateExamCategory,
} from "@/hooks/academic/use-exam-categories";

import type { ExamCategory } from "@/types/exam-category";

// UI Components
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

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Types
type ExamCategoryTableProps = {
  onEdit?: (category: ExamCategory) => void;
  canManage?: boolean;
};

interface CategoryLogoProps {
  name: string;
  logo?: string | null;
}

// ---------------------------------------------
// Category Logo
// ---------------------------------------------

export function CategoryLogo({ name, logo }: CategoryLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border bg-primary/5"
        aria-label={`No logo available for ${name}`}
      >
        <ImageIcon
          className="size-4 text-muted-foreground"
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <a
      href={logo}
      target="_blank"
      rel="noopener noreferrer"
      className="relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-background"
      aria-label={`Open logo for ${name}`}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        sizes="36px"
        className="object-contain p-1"
        onError={() => setHasError(true)}
      />
    </a>
  );
}

// ---------------------------------------------
// Loading Skeleton
// ---------------------------------------------

function CategoryListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Loading exam categories"
      aria-busy="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-14 w-full rounded-md" />
      ))}
    </div>
  );
}

// ---------------------------------------------
// Empty State
// ---------------------------------------------

function CategoryEmptyState({ isSearching }: { isSearching: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Tags className="size-7 text-muted-foreground" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          {isSearching ? "No matching categories" : "No exam categories yet"}
        </h3>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different category name or slug."
            : "Categories will appear here when they are created."}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Error State
// ---------------------------------------------

function CategoryErrorState({
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
        <RefreshCw className="size-7 text-destructive" />
      </div>

      <div className="space-y-1">
        <h3 className="font-semibold text-foreground">
          Failed to load exam categories
        </h3>

        <p className="text-sm text-muted-foreground">{message}</p>
      </div>

      <Button
        variant="outline"
        onClick={onRetry}
        disabled={isFetching}
        className="rounded-button"
      >
        <RefreshCw
          className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
        />
        {isFetching ? "Retrying..." : "Try again"}
      </Button>
    </div>
  );
}

// ---------------------------------------------
// Category Status Badge
// ---------------------------------------------

function CategoryStatusBadge({ isActive }: { isActive: boolean }) {
  return isActive ? (
    <Badge variant="outline" className="gap-1 text-emerald-600">
      Active
    </Badge>
  ) : (
    <Badge variant="outline" className="gap-1 text-muted-foreground">
      Inactive
    </Badge>
  );
}

// ---------------------------------------------
// Deactivate Confirmation Dialog
// ---------------------------------------------

function DeactivateCategoryDialog({
  category,
  isDeactivating,
  onClose,
  onConfirm,
}: {
  category: ExamCategory | null;
  isDeactivating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={Boolean(category)}
      onOpenChange={(open) => {
        if (!open && !isDeactivating) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex size-11 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-5 text-destructive" />
          </div>

          <AlertDialogTitle>Deactivate Exam Category?</AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">
              {category?.name}
            </span>
            ?
            <br />
            Existing records will not be deleted. The category will no longer be
            available for new selections.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeactivating} onClick={onClose}>
            Cancel
          </AlertDialogCancel>

          <AlertDialogAction
            disabled={isDeactivating}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeactivating ? (
              <>
                <RefreshCw className="mr-2 size-4 animate-spin" />
                Deactivating...
              </>
            ) : (
              <>
                <Ban className="mr-2 size-4" />
                Deactivate Category
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------
// Exam Category Table
// ---------------------------------------------

export function ExamCategoryTable({
  onEdit,
  canManage = false,
}: ExamCategoryTableProps) {
  // Fetch categories
  const {
    data: categories,
    isPending,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetExamCategories(false);

  // Deactivate mutation
  const deactivateMutation = useDeactivateExamCategory();

  const isDeactivating = deactivateMutation.isPending;

  // Local states
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(
    null,
  );

  // -------------------------------------------
  // Search and Filter
  // -------------------------------------------

  const filteredCategories = useMemo(() => {
    const list = categories ?? [];
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((category) =>
      [category.name, category.slug].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [categories, search]);

  // -------------------------------------------
  // Refresh
  // -------------------------------------------

  function handleRefresh() {
    void refetch();
  }

  // -------------------------------------------
  // Deactivate Category
  // -------------------------------------------

  async function handleDeactivate() {
    if (!selectedCategory || isDeactivating) return;

    try {
      await deactivateMutation.mutateAsync(selectedCategory.id);

      toast.success("Exam category deactivated successfully.");

      setSelectedCategory(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to deactivate exam category.",
      );
    }
  }

  // -------------------------------------------
  // Render
  // -------------------------------------------

  return (
    <>
      <Card className="rounded-card border-border/70 bg-card shadow-sm">
        {/* Header */}

        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                <Tags className="size-5 text-primary" />
              </div>
              Exam Categories
            </CardTitle>

            <CardDescription>
              Manage examination categories, logos and slugs.
            </CardDescription>
          </div>

          {/* Search */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search categories..."
              className="h-10 rounded-input bg-background pl-9"
              aria-label="Search exam categories"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <CategoryListSkeleton />
          ) : isError ? (
            <CategoryErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching categories."
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
                    {filteredCategories.length}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {filteredCategories.length === 1
                      ? "Category found"
                      : "Categories found"}
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

              {filteredCategories.length === 0 ? (
                <CategoryEmptyState isSearching={Boolean(search.trim())} />
              ) : (
                <div className="relative max-h-[500px] w-full max-w-full overflow-auto rounded-section border border-border">
                  <Table className="w-full min-w-[650px]">
                    {/* Table Header */}

                    <TableHeader className="sticky top-0 z-10 bg-muted shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-64 font-semibold">
                          Exam Category
                        </TableHead>

                        <TableHead className="min-w-48 font-semibold">
                          Category Slug
                        </TableHead>

                        <TableHead className="min-w-28 font-semibold">
                          Status
                        </TableHead>

                        {canManage && (
                          <TableHead className="w-16 text-right font-semibold">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}

                    <TableBody>
                      {filteredCategories.map((category) => (
                        <TableRow
                          key={category.id}
                          className="transition-colors hover:bg-accent/40"
                        >
                          {/* Category Name + Logo */}

                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <CategoryLogo
                                name={category.name}
                                logo={category.logo}
                              />

                              <span>{category.name || "—"}</span>
                            </div>
                          </TableCell>

                          {/* Category Slug */}

                          <TableCell>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                              {category.slug || "—"}
                            </span>
                          </TableCell>

                          {/* Status */}

                          <TableCell>
                            <CategoryStatusBadge isActive={category.isActive} />
                          </TableCell>

                          {/* Actions */}

                          {canManage && (
                            <TableCell className="text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="size-8"
                                      aria-label={`Actions for ${category.name}`}
                                    >
                                      <MoreHorizontal className="size-4" />
                                    </Button>
                                  }
                                />

                                <DropdownMenuContent align="end">
                                  {/* Edit */}

                                  <DropdownMenuItem
                                    onClick={() => onEdit?.(category)}
                                  >
                                    <Pencil className="mr-2 size-4" />
                                    Edit
                                  </DropdownMenuItem>

                                  {/* Deactivate */}

                                  {category.isActive && (
                                    <DropdownMenuItem
                                      onClick={() =>
                                        setSelectedCategory(category)
                                      }
                                      className="text-destructive focus:text-destructive"
                                    >
                                      <Ban className="mr-2 size-4" />
                                      Deactivate
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Deactivate Confirmation Dialog */}

      <DeactivateCategoryDialog
        category={selectedCategory}
        isDeactivating={isDeactivating}
        onClose={() => setSelectedCategory(null)}
        onConfirm={handleDeactivate}
      />
    </>
  );
}

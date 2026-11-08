
"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Ban,
  FileText,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetAllExaminations,
  useDeactivateExamination,
  type Examination,
} from "@/hooks/academic/use-exams";

import ExamForm from "./exam-form";

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

// ---------------------------------------------
// Loading Skeleton
// ---------------------------------------------

function ExamListSkeleton() {
  return (
    <div
      className="space-y-3"
      aria-label="Loading exams"
      aria-busy="true"
    >
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-14 w-full rounded-md"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------
// Empty State
// ---------------------------------------------

function ExamEmptyState({
  isSearching,
}: {
  isSearching: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">

      <div className="space-y-1">
        <h1 className="font-semibold text-foreground text-2xl">
          {isSearching ? "No matching exams" : "No exams yet"}
        </h1>

        <p className="max-w-sm text-sm text-muted-foreground">
          {isSearching
            ? "Try searching with a different exam name, slug or category."
            : "Exams will appear here when they are created."}
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------
// Error State
// ---------------------------------------------

function ExamErrorState({
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
          Failed to load exams
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

// ---------------------------------------------
// Status Badge
// ---------------------------------------------

function ExamStatusBadge({
  isActive,
}: {
  isActive: boolean;
}) {
  return isActive ? (
    <Badge
      variant="outline"
      className="gap-1 text-emerald-600"
    >
      Active
    </Badge>
  ) : (
    <Badge
      variant="outline"
      className="gap-1 text-muted-foreground"
    >
      Inactive
    </Badge>
  );
}

// ---------------------------------------------
// Deactivate Confirmation Dialog
// ---------------------------------------------

function DeactivateExamDialog({
  exam,
  isDeactivating,
  onClose,
  onConfirm,
}: {
  exam: Examination | null;
  isDeactivating: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  return (
    <AlertDialog
      open={Boolean(exam)}
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

          <AlertDialogTitle>
            Deactivate Exam?
          </AlertDialogTitle>

          <AlertDialogDescription>
            Are you sure you want to deactivate{" "}
            <span className="font-semibold text-foreground">
              {exam?.name}
            </span>
            ?

            The exam will no longer be available to users.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isDeactivating}
            onClick={onClose}
          >
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
                Deactivate Exam
              </>
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ---------------------------------------------
// Exam List Component
// ---------------------------------------------

export default function ExamList() {
  // Fetch examinations
  const {
    data: exams,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useGetAllExaminations();

  // Deactivate mutation
  const deactivateMutation = useDeactivateExamination();

  const isDeactivating = deactivateMutation.isPending;

  // Local states
  const [search, setSearch] = useState("");

  const [selectedExam, setSelectedExam] =
    useState<Examination | null>(null);

  const [examToDeactivate, setExamToDeactivate] =
    useState<Examination | null>(null);

  // -------------------------------------------
  // Search and Filter
  // -------------------------------------------

  const filteredExams = useMemo(() => {
    const list = exams ?? [];
    const query = search.trim().toLowerCase();

    if (!query) return list;

    return list.filter((exam) =>
      [
        exam.name,
        exam.slug,
        exam.categoryName,
        exam.categorySlug,
        exam.isActive ? "active" : "inactive",
      ].some((value) =>
        String(value ?? "")
          .toLowerCase()
          .includes(query)
      )
    );
  }, [exams, search]);

  // -------------------------------------------
  // Refresh
  // -------------------------------------------

  function handleRefresh() {
    void refetch();
  }

  // -------------------------------------------
  // Deactivate Exam
  // -------------------------------------------

  async function handleDeactivateExam() {
    if (!examToDeactivate || isDeactivating) return;

    try {
      await deactivateMutation.mutateAsync(
        examToDeactivate.id
      );

      toast.success("Exam deactivated successfully.");

      setExamToDeactivate(null);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to deactivate exam. Please try again."
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
                <FileText className="size-5 text-primary" />
              </div>

              Exams
            </CardTitle>

            <CardDescription>
              Manage exams, categories, slugs and availability.
            </CardDescription>
          </div>

          {/* Search */}

          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search exams..."
              className="h-10 rounded-input bg-background pl-9"
              aria-label="Search exams"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isLoading ? (
            <ExamListSkeleton />
          ) : isError ? (
            <ExamErrorState
              message={
                error instanceof Error
                  ? error.message
                  : "Something went wrong while fetching exams."
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
                    {filteredExams.length}
                  </Badge>

                  <span className="text-sm text-muted-foreground">
                    {filteredExams.length === 1
                      ? "Exam found"
                      : "Exams found"}
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

              {filteredExams.length === 0 ? (
                <ExamEmptyState
                  isSearching={Boolean(search.trim())}
                />
              ) : (
                <div className="relative max-h-[500px] w-full max-w-full overflow-auto rounded-section border border-border">
                  <Table className="min-w-[800px] w-full">

                    {/* Table Header */}

                    <TableHeader className="sticky top-0 z-10 bg-muted shadow-sm">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="min-w-52 font-semibold">
                          Exam Name
                        </TableHead>

                        <TableHead className="min-w-44 font-semibold">
                          Exam Category
                        </TableHead>

                        <TableHead className="min-w-48 font-semibold">
                          Exam Slug
                        </TableHead>

                        <TableHead className="min-w-28 font-semibold">
                          Status
                        </TableHead>

                        <TableHead className="w-16 text-right font-semibold">
                          Actions
                        </TableHead>
                      </TableRow>
                    </TableHeader>

                    {/* Table Body */}

                    <TableBody>
                      {filteredExams.map((exam) => (
                        <TableRow
                          key={exam.id}
                          className="transition-colors hover:bg-accent/40"
                        >

                          {/* Exam Name */}

                          <TableCell className="font-medium whitespace-nowrap">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                                {exam.name?.charAt(0)?.toUpperCase() || "E"}
                              </div>

                              <span>
                                {exam.name || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Exam Category */}

                          <TableCell>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">

                              <span>
                                {exam.categoryName || "—"}
                              </span>
                            </div>
                          </TableCell>

                          {/* Exam Slug */}

                          <TableCell>
                            <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                              {exam.slug || "—"}
                            </span>
                          </TableCell>

                          {/* Status */}

                          <TableCell>
                            <ExamStatusBadge
                              isActive={exam.isActive}
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
                                    aria-label={`Actions for ${exam.name}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                }
                              />

                              <DropdownMenuContent align="end">

                                {/* Edit */}

                                <DropdownMenuItem
                                  onClick={() =>
                                    setSelectedExam(exam)
                                  }
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </DropdownMenuItem>

                                {/* Deactivate */}

                                {exam.isActive && (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      setExamToDeactivate(exam)
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

      {/* Edit Exam Dialog */}

      {selectedExam && (
        <ExamForm
          key={selectedExam.id}
          open={Boolean(selectedExam)}
          hideTrigger
          initialData={{
            id: selectedExam.id,
            categoryId: selectedExam.categoryId,
            name: selectedExam.name,
            slug: selectedExam.slug,
            isActive: selectedExam.isActive,
          }}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedExam(null);
            }
          }}
          onSuccessCallback={() => {
            setSelectedExam(null);
          }}
        />
      )}

      {/* Deactivate Confirmation Dialog */}

      <DeactivateExamDialog
        exam={examToDeactivate}
        isDeactivating={isDeactivating}
        onClose={() => setExamToDeactivate(null)}
        onConfirm={handleDeactivateExam}
      />
    </>
  );
}

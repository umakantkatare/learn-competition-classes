"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Ban,
  Tags,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetExamCategories,
  useDeactivateExamCategory,
} from "@/hooks/academic/use-exam-categories";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

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

import { Skeleton } from "@/components/ui/skeleton";
import { ExamCategory } from "@/types/exam-category";

type ExamCategoryTableProps = {
  onEdit?: (category: ExamCategory) => void;
  canManage?: boolean;
};

export function ExamCategoryTable({
  onEdit,
  canManage = false,
}: ExamCategoryTableProps) {
  const [search, setSearch] = useState("");

  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(
    null,
  );

  const {
    data: categories,
    isPending,
    isError,
    error,
    refetch,
  } = useGetExamCategories(false);

  const deactivateMutation = useDeactivateExamCategory();

  const filteredCategories = useMemo(() => {
    const list: ExamCategory[] = categories ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((category) => {
      return (
        category.name.toLowerCase().includes(query) ||
        category.slug.toLowerCase().includes(query)
      );
    });
  }, [categories, search]);

  async function handleDeactivate() {
    if (!selectedCategory) {
      return;
    }

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

  return (
    <>
      <Card className="border-border/70 shadow-sm">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Tags className="size-5 text-primary" />
              Exam Categories
            </CardTitle>

            <CardDescription>
              Manage examination categories across LCC.
            </CardDescription>
          </div>

          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name or slug..."
              className="pl-9"
              aria-label="Search exam categories"
            />
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <div className="space-y-3" aria-label="Loading exam categories">
              {Array.from({ length: 5 }).map((_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <p className="text-sm text-destructive">
                {error instanceof Error
                  ? error.message
                  : "Failed to load exam categories."}
              </p>

              <Button variant="outline" onClick={() => void refetch()}>
                Try again
              </Button>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <Tags className="size-10 text-muted-foreground/50" />

              <p className="font-medium">
                {search ? "No matching categories" : "No exam categories yet"}
              </p>

              <p className="text-sm text-muted-foreground">
                {search
                  ? "Try another search term."
                  : "Create an exam category to get started."}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-3 text-sm text-muted-foreground">
                {filteredCategories.length}{" "}
                {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                found
              </div>

              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="min-w-52">Category</TableHead>

                      <TableHead className="min-w-48">Slug</TableHead>

                      <TableHead className="min-w-32">Icon</TableHead>

                      <TableHead className="min-w-28">Status</TableHead>

                      {canManage && (
                        <TableHead className="w-16 text-right">
                          Actions
                        </TableHead>
                      )}
                    </TableRow>
                  </TableHeader>

                  <TableBody>
                    {filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell className="font-medium">
                          {category.name}
                        </TableCell>

                        <TableCell>
                          <code className="rounded bg-muted px-2 py-1 text-xs">
                            {category.slug}
                          </code>
                        </TableCell>

                        <TableCell>
                          {category.iconUrl ? (
                            <div className="flex items-center gap-3">
                              {/* Icon preview */}
                              <a
                                href={category.iconUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted"
                                aria-label={`Open icon for ${category.name}`}
                              >
                                <img
                                  src={category.iconUrl}
                                  alt={`${category.name} icon`}
                                  className="size-full object-contain p-1"
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              </a>

                              {/* Icon link */}
                              <div className="min-w-0">
                                <p className="max-w-32 truncate text-sm font-medium">
                                  {category.name}
                                </p>

                                <a
                                  href={category.iconUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary hover:underline"
                                >
                                  View original
                                  <ExternalLink className="size-3" />
                                </a>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="flex size-12 items-center justify-center rounded-lg border border-dashed bg-muted">
                                <Tags className="size-5 text-muted-foreground" />
                              </div>

                              <span className="text-sm text-muted-foreground">
                                No icon
                              </span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              category.isActive ? "default" : "secondary"
                            }
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>

                        {canManage && (
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                render={
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label={`Actions for ${category.name}`}
                                  >
                                    <MoreHorizontal className="size-4" />
                                  </Button>
                                }
                              />

                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => onEdit?.(category)}
                                >
                                  <Pencil className="mr-2 size-4" />
                                  Edit
                                </DropdownMenuItem>

                                {category.isActive && (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      setSelectedCategory(category)
                                    }
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
            </>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(selectedCategory)}
        onOpenChange={(open) => {
          if (!open && !deactivateMutation.isPending) {
            setSelectedCategory(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate exam category?</AlertDialogTitle>

            <AlertDialogDescription>
              <strong>{selectedCategory?.name}</strong> will be deactivated.
              Existing records will not be deleted. You can continue only if you
              have permission to perform this action.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={deactivateMutation.isPending}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              disabled={deactivateMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                void handleDeactivate();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivateMutation.isPending ? "Deactivating..." : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

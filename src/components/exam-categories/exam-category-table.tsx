"use client";

import { useMemo, useState } from "react";
import {
  Search,
  MoreHorizontal,
  Pencil,
  Ban,
  Tags,
  RefreshCw,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

import {
  useGetExamCategories,
  useDeactivateExamCategory,
} from "@/hooks/academic/use-exam-categories";

import type { ExamCategory } from "@/types/exam-category";

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
import Image from "next/image";

type ExamCategoryTableProps = {
  onEdit?: (category: ExamCategory) => void;
  canManage?: boolean;
};
interface CategoryLogoProps {
  name: string;
  logo?: string | null;
}


export function CategoryLogo({ name, logo }: CategoryLogoProps) {
  const [hasError, setHasError] = useState(false);

  if (!logo || hasError) {
    return (
      <div
        className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed bg-muted"
        aria-label={`No logo available for ${name}`}
      >
        <ImageIcon
          className="size-5 text-muted-foreground"
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
      className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted"
      aria-label={`Open logo for ${name}`}
    >
      <Image
        src={logo}
        alt={`${name} logo`}
        fill
        sizes="48px"
        className="object-contain p-1"
        onError={() => setHasError(true)}
      />
    </a>
  );
}

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
    isFetching,
  } = useGetExamCategories(false);

  const deactivateMutation = useDeactivateExamCategory();

  const filteredCategories = useMemo(() => {
    const list: ExamCategory[] = categories ?? [];
    const query = search.trim().toLowerCase();

    if (!query) {
      return list;
    }

    return list.filter((category) => {
      const name = String(category.name ?? "").toLowerCase();
      const slug = String(category.slug ?? "").toLowerCase();

      return name.includes(query) || slug.includes(query);
    });
  }, [categories, search]);

  async function handleDeactivate() {
    if (!selectedCategory || deactivateMutation.isPending) {
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
            <div
              className="space-y-3"
              aria-label="Loading exam categories"
              aria-busy="true"
            >
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

              <Button
                variant="outline"
                onClick={() => void refetch()}
                disabled={isFetching}
              >
                <RefreshCw
                  className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
                />
                {isFetching ? "Retrying..." : "Try again"}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-3 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                <span>
                  {filteredCategories.length}{" "}
                  {filteredCategories.length === 1 ? "category" : "categories"}{" "}
                  found
                </span>

                {isFetching && <span aria-live="polite">Updating...</span>}
              </div>

              {filteredCategories.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-12 text-center">
                  <Tags className="size-10 text-muted-foreground/50" />

                  <p className="font-medium">
                    {search.trim()
                      ? "No matching categories"
                      : "No exam categories yet"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {search.trim()
                      ? "Try another search term."
                      : "Create an exam category to get started."}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-52">Category</TableHead>

                        <TableHead className="min-w-48">Slug</TableHead>

                        <TableHead className="min-w-28">Logo</TableHead>

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
                            <CategoryLogo
                              name={category.name}
                              logo={category.logo}
                            />
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
              )}
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
              Existing records will not be deleted. You can reactivate this
              category later if your application supports reactivation.
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

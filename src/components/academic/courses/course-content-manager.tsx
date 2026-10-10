"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Film,
  ClipboardCheck,
  Plus,
  MoreHorizontal,
  RefreshCw,
} from "lucide-react";

import {
  courseContentKeys,
  useCourseContent,
} from "@/hooks/academic/use-course-content";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { deleteCourseContentAction } from "@/actions/academic/course/courses-subjects-actions";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { CourseContentItem } from "@/services/academic/course-content/client";

type ContentFilter = "ALL" | "VIDEO" | "PDF" | "TEST";

interface CourseContentManagerProps {
  courseId: string;
}

const contentTypeConfig = {
  VIDEO: {
    label: "Video",
    icon: Film,
  },

  PDF: {
    label: "PDF",
    icon: FileText,
  },

  TEST: {
    label: "Test",
    icon: ClipboardCheck,
  },
} as const;

export function CourseContentManager({ courseId }: CourseContentManagerProps) {
  const [filter, setFilter] = useState<ContentFilter>("ALL");
  const [contentToDelete, setContentToDelete] =
    useState<CourseContentItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: content = [],
    isPending,
    isError,
    refetch,
    isFetching,
  } = useCourseContent(courseId);

  const filteredContent = useMemo(() => {
    if (filter === "ALL") return content;
    return content.filter((item) => item.type === filter);
  }, [content, filter]);

  const counts = useMemo(
    () => ({
      ALL: content.length,
      VIDEO: content.filter((item) => item.type === "VIDEO").length,
      PDF: content.filter((item) => item.type === "PDF").length,
      TEST: content.filter((item) => item.type === "TEST").length,
    }),

    [content],
  );

  async function handleDelete() {
    if (!contentToDelete || isDeleting) return;
    setIsDeleting(true);

    try {
      const result = await deleteCourseContentAction(
        courseId,
        contentToDelete.id,
      );

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      await queryClient.invalidateQueries({
        queryKey: courseContentKeys.byCourse(courseId),
      });
      toast.success("Course content deleted");
      setContentToDelete(null);
    } catch {
      toast.error("Failed to delete course content");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <Card className="rounded-card border-border bg-surface">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-text-primary">
                Course Content
              </CardTitle>

              <CardDescription className="text-text-secondary">
                Manage videos, study materials, and tests.
              </CardDescription>
            </div>

            <Button asChild className="rounded-button">
              <Link href={`/academic/courses/${courseId}/content/create`}>
                <Plus className="mr-2 size-4" />
                Add Content
              </Link>
            </Button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["ALL", "VIDEO", "PDF", "TEST"] as const).map((type) => (
                <Button
                  key={type}
                  type="button"
                  size="sm"
                  variant={filter === type ? "default" : "outline"}
                  className="rounded-button"
                  onClick={() => setFilter(type)}
                >
                  {type === "ALL" ? "All" : contentTypeConfig[type].label}
                  <span className="ml-2 text-xs opacity-75">
                    {counts[type]}
                  </span>
                </Button>
              ))}
            </div>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => void refetch()}
              disabled={isFetching}
            >
              <RefreshCw
                className={`mr-2 size-4 ${isFetching ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {isPending ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 rounded-card border border-border p-4"
                >
                  <Skeleton className="size-10 rounded-md" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-text-secondary">
                Unable to load course content.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void refetch()}
              >
                Try Again
              </Button>
            </div>
          ) : filteredContent.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border px-4 py-12 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-brand-primary/10">
                <Film className="size-6 text-brand-primary" />
              </div>
              <div className="space-y-1">
                <p className="font-medium text-text-primary">
                  {content.length === 0
                    ? "No course content yet"
                    : `No ${
                        filter === "VIDEO"
                          ? "videos"
                          : filter === "PDF"
                            ? "PDFs"
                            : "tests"
                      } found`}
                </p>
                <p className="text-sm text-text-secondary">
                  {content.length === 0
                    ? "Add your first video, PDF, or test to this course."
                    : "Try selecting another content type."}
                </p>
              </div>
              {content.length === 0 && (
                <Button asChild className="rounded-button">
                  <Link href={`/academic/courses/${courseId}/content/create`}>
                    <Plus className="mr-2 size-4" />
                    Add First Content
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredContent.map((item) => {
                const config = contentTypeConfig[item.type];
                const Icon = config.icon;
                return (
                  <div
                    key={item.id}
                    className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center"
                  >
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-brand-primary/10">
                      <Icon className="size-5 text-brand-primary" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate font-medium text-text-primary">
                        {item.title}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="outline">{config.label}</Badge>
                        <Badge
                          variant={item.isPublished ? "default" : "secondary"}
                        >
                          {item.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {item.type === "VIDEO" && item.isPreview && (
                          <Badge variant="outline">Free Preview</Badge>
                        )}
                        <span className="text-xs text-text-secondary">
                          Order: {item.sortOrder}
                        </span>
                      </div>
                      {item.description && (
                        <p className="line-clamp-2 text-sm text-text-secondary">
                          {item.description}
                        </p>
                      )}
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          aria-label={`Actions for ${item.title}`}
                        >
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link
                            href={`/academic/courses/${courseId}/content/${item.id}/edit`}
                          >
                            Edit content
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setContentToDelete(item)}
                        >
                          Delete content
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
      <AlertDialog
        open={contentToDelete !== null}
        onOpenChange={(open) => {
          if (!open && !isDeleting) setContentToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this content?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes
              <span className="font-medium">
                {contentToDelete?.title ?? "this content"}
              </span>{" "}
              from the course. The original video or PDF file will not be
              deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <Button
              type="button"
              variant="destructive"
              disabled={isDeleting}
              onClick={() => void handleDelete()}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

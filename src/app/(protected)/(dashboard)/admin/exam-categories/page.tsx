"use client";

import { useState } from "react";
import { Plus, Tags } from "lucide-react";

import { Button } from "@/components/ui/button";
// import {
//   Card,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

import { ExamCategoryTable } from "@/components/exam-categories/exam-category-table";
import { ExamCategoryDialog } from "@/components/exam-categories/exam-category-dialog";

import type { ExamCategory } from "@/types/exam-category";

export default function ExamCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExamCategory | null>(
    null,
  );

  function handleCreate() {
    setSelectedCategory(null);
    setDialogOpen(true);
  }

  function handleEdit(category: ExamCategory) {
    setSelectedCategory(category);
    setDialogOpen(true);
  }

  function handleDialogOpenChange(open: boolean) {
    setDialogOpen(open);

    if (!open) {
      setSelectedCategory(null);
    }
  }

  return (
    <div className="space-y-6 p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Exam Categories
          </h1>

          <p className="text-sm text-muted-foreground">
            Manage categories used to organize examinations.
          </p>
        </div>

        <Button onClick={handleCreate} className="w-full sm:w-auto">
          <Plus className="mr-2 size-4" />
          Add Category
        </Button>
      </div>

      {/* Categories Table */}
      <ExamCategoryTable canManage onEdit={handleEdit} />

      {/* Create / Edit Dialog */}
      <ExamCategoryDialog
        open={dialogOpen}
        onOpenChange={handleDialogOpenChange}
        category={selectedCategory}
      />
    </div>
  );
}

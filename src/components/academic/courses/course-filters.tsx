"use client";

import { Search, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CourseStatusFilter = "all" | "active" | "inactive";

interface CourseFiltersProps {
  search: string;
  status: CourseStatusFilter;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: CourseStatusFilter) => void;
}

export function CourseFilters({
  search,
  status,
  onSearchChange,
  onStatusChange,
}: CourseFiltersProps) {
  const hasFilters = search.length > 0 || status !== "all";

  function clearFilters() {
    onSearchChange("");
    onStatusChange("all");
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search courses by name or slug..."
          aria-label="Search courses"
          className="pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(value) => {
          if (value === "all" || value === "active" || value === "inactive") {
            onStatusChange(value);
          }
        }}
      >
        <SelectTrigger
          aria-label="Filter courses by status"
          className="w-full sm:w-44"
        >
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="all">All statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={clearFilters}
          className="shrink-0"
        >
          <X className="mr-2 size-4" />
          Clear filters
        </Button>
      )}
    </div>
  );
}

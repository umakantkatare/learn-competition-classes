"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExamFiltersProps {
  search: string;
  year: string;
  status: string;
  onSearchChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onStatusChange: (value: string) => void;
}

export function ExamFilters({
  search,
  year,
  status,
  onSearchChange,
  onYearChange,
  onStatusChange,
}: ExamFiltersProps) {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-center">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search exams..."
          className="pl-9"
        />
      </div>

      <Select value={year} onValueChange={onYearChange}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Year" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All Years">All Years</SelectItem>
          <SelectItem value="2026">2026</SelectItem>
          <SelectItem value="2025">2025</SelectItem>
          <SelectItem value="2024">2024</SelectItem>
        </SelectContent>
      </Select>

      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="w-full md:w-[160px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>

        <SelectContent>
          <SelectItem value="All Status">All Status</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="inactive">Inactive</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}

"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

interface TopicFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function TopicFilters({ search, onSearchChange }: TopicFiltersProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative w-full sm:max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-secondary" />

        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search topics..."
          className="pl-9"
        />
      </div>
    </div>
  );
}

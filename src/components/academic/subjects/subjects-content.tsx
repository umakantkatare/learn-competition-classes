"use client";

import { useMemo, useState } from "react";

import { SubjectFilters } from "./subject-filters";
import { SubjectTable } from "./subject-table";
export function SubjectsContent() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  const filters = useMemo(
    () => ({
      search,
      status,
    }),
    [search, status],
  );

  return (
    <div className="rounded-card border border-border bg-surface">
      <div className="border-b border-border p-4">
        <SubjectFilters
          search={search}
          status={status}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
        />
      </div>

      <SubjectTable filters={filters} />
    </div>
  );
}
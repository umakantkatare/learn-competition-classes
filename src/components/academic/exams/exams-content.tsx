"use client";

import { useMemo, useState } from "react";

import { ExamFilters } from "./exam-filters";
import { ExamTable } from "./exam-table";

export function ExamsContent() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [status, setStatus] = useState("all");

  const filters = useMemo(
    () => ({
      search,
      year,
      status,
    }),
    [search, year, status],
  );

  return (
    <div className="rounded-card border border-border bg-surface">
      <div className="border-b border-border p-4">
        <ExamFilters
          search={search}
          year={year}
          status={status}
          onSearchChange={setSearch}
          onYearChange={setYear}
          onStatusChange={setStatus}
        />
      </div>

      <ExamTable filters={filters} />
    </div>
  );
}

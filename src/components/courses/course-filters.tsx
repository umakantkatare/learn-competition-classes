"use client";

import { useCourseUIStore } from "@/store/course/course-store";

export function CourseFilters() {
  const search = useCourseUIStore((state) => state.search);
  const setSearch = useCourseUIStore((state) => state.setSearch);

  const activeOnly = useCourseUIStore((state) => state.activeOnly);
  const setActiveOnly = useCourseUIStore((state) => state.setActiveOnly);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        placeholder="Search courses..."
        className="h-10 rounded-md border px-3"
      />

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={activeOnly}
          onChange={(event) => setActiveOnly(event.target.checked)}
        />
        Active courses only
      </label>
    </div>
  );
}

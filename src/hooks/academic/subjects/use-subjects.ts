"use client";

import { useQuery } from "@tanstack/react-query";

import type { Subject } from "@/services/academic/subject/types";

async function fetchSubjects(): Promise<Subject[]> {
  const response = await fetch("/api/academic/subjects");

  if (!response.ok) {
    throw new Error("Unable to fetch subjects.");
  }

  return response.json();
}

export function useSubjects() {
  return useQuery({
    queryKey: ["academic", "subjects"],
    queryFn: fetchSubjects,
  });
}

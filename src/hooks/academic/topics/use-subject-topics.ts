"use client";

import { useQuery } from "@tanstack/react-query";

import type { Topic } from "@/services/academic/topic/types";

async function fetchSubjectTopics(subjectId: string): Promise<Topic[]> {
  const response = await fetch(`/api/academic/subjects/${subjectId}/topics`);

  if (!response.ok) {
    throw new Error("Unable to fetch subject topics.");
  }

  return response.json();
}

export function useSubjectTopics(subjectId: string) {
  return useQuery({
    queryKey: ["academic", "subject-topics", subjectId],
    queryFn: () => fetchSubjectTopics(subjectId),
    enabled: Boolean(subjectId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

"use client";

import { useQuery } from "@tanstack/react-query";

import type { TopicWithSubject } from "@/services/academic/topic/types";

async function fetchTopics(): Promise<TopicWithSubject[]> {
  const response = await fetch("/api/academic/topics");

  if (!response.ok) {
    throw new Error("Unable to fetch topics.");
  }

  return response.json();
}

export function useTopics() {
  return useQuery({
    queryKey: ["academic", "topics"],
    queryFn: fetchTopics,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
}

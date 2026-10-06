"use client";

import { useQuery } from "@tanstack/react-query";
import { Exam } from "@/services/academic/exam/types";

async function fetchExams(): Promise<Exam[]> {
  const response = await fetch("/api/academic/exams");

  if (!response.ok) {
    throw new Error("Unable to fetch exams.");
  }

  return response.json();
}

export function useExams() {
  return useQuery({
    queryKey: ["academic", "exams"],
    queryFn: fetchExams,
  });
}

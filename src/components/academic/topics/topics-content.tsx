"use client";

import { useMemo, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { TopicPageHeader } from "./topic-page-header";
import { TopicFilters } from "./topic-filters";
import { useTopics } from "@/hooks/academic/topics/use-topic";
import { TopicTable } from "./topic-table";
import { TopicWithSubject } from "@/services/academic/topic/types";
import { TopicActions } from "./topic-actions";

export function TopicsContent() {
  const { data: topics = [], isLoading, isError, refetch } = useTopics();

  const [search, setSearch] = useState("");
  const [statusTopic, setStatusTopic] = useState<TopicWithSubject | null>(null);

  const filteredTopics = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return topics;
    }

    return topics.filter((topic) =>
      [topic.name, topic.slug].some((value) =>
        value.toLowerCase().includes(query),
      ),
    );
  }, [topics, search]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <TopicPageHeader />

        <div className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <Skeleton className="h-80 w-full" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <TopicPageHeader />

        <div className="rounded-card border border-border bg-surface p-8 text-center">
          <p className="font-medium text-text-primary">Unable to load topics</p>

          <p className="mt-1 text-sm text-text-secondary">
            Something went wrong while loading the topics.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 text-sm font-medium text-brand-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TopicPageHeader />

      <div className="space-y-4">
        <TopicFilters search={search} onSearchChange={setSearch} />

        <TopicTable topics={filteredTopics} onStatusChange={setStatusTopic} />

        <TopicActions
          topic={statusTopic}
          onClose={() => setStatusTopic(null)}
        />
      </div>
    </div>
  );
}

import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TopicPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary">
          Topics
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          Manage academic topics under subjects.
        </p>
      </div>

      <Button asChild>
        <Link href="/academic/topics/create">
          <Plus className="mr-2 size-4" />
          Add Topic
        </Link>
      </Button>
    </div>
  );
}

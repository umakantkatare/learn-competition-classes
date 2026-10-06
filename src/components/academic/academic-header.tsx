import { Bell } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AcademicHeader() {
  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-surface px-4 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-lg font-semibold text-text-primary">
          Academic
        </h1>

        <p className="hidden text-sm text-text-secondary sm:block">
          Manage your academic structure
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notifications"
      >
        <Bell className="size-5" />
      </Button>
    </header>
  );
}
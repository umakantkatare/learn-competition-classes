import {
  BadgeCheck,
  MessageSquareText,
  Users,
  UserRoundCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type StatItem = {
  icon: LucideIcon;
  value: string;
  title: string;
  description?: string;
};

const stats: StatItem[] = [
  {
    icon: Users,
    value: "200+",
    title: "Selections",
    description: "(2023–24–25)",
  },
  {
    icon: BadgeCheck,
    value: "12+",
    title: "Years of Experience",
  },
  {
    icon: MessageSquareText,
    value: "Bilingual Classes",
    title: "(Hindi + English)",
  },
  {
    icon: UserRoundCheck,
    value: "Regular Tests",
    title: "& Doubt Support",
  },
];

export function StatsBar() {
  return (
    <section className="relative z-20 -mt-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 lg:p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-y-5 lg:grid-cols-4 lg:gap-y-0">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`flex min-w-0 items-center gap-3 px-2 sm:gap-4 sm:px-4 lg:px-5 ${
                  index > 0
                    ? "border-t border-border pt-4 sm:border-t-0 sm:pt-0"
                    : ""
                } ${index % 2 !== 0 ? "sm:border-l sm:border-border" : ""} ${
                  index > 0 ? "lg:border-l lg:border-border" : ""
                }`}
              >
                {/* Icon */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 sm:size-12 lg:size-14">
                  <Icon className="size-5 text-primary sm:size-6 lg:size-7" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h3 className="break-words text-base font-extrabold leading-tight text-foreground sm:text-lg lg:text-xl">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-foreground sm:text-sm">
                    {stat.title}
                  </p>

                  {stat.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {stat.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

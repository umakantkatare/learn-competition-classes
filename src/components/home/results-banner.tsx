
import {
  Trophy,
  Users,
  GraduationCap,
  CalendarCheck,
  Star,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Achievement = {
  icon: LucideIcon;
  value: string;
  label: string;
};

const achievements: Achievement[] = [
  {
    icon: Users,
    value: "200+",
    label: "Selections",
  },
  {
    icon: GraduationCap,
    value: "10,000+",
    label: "Students Guided",
  },
  {
    icon: CalendarCheck,
    value: "12+",
    label: "Years of Experience",
  },
  {
    icon: Star,
    value: "95%",
    label: "Student Satisfaction",
  },
];

export function ResultsBanner() {
  return (
    <section className="bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-border bg-card px-5 py-8 shadow-sm sm:px-8 sm:py-10 lg:px-12 lg:py-12">

        {/* Background Decorations */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border-[30px] border-primary/5"
        />

        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-32 -left-16 size-64 rounded-full border-[30px] border-primary/5"
        />

        {/* Heading */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">

          {/* Icon */}
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary sm:size-16">
            <Trophy className="size-7 sm:size-8" />
          </div>

          {/* Title */}
          <h2 className="mt-5 text-2xl font-extrabold leading-tight text-foreground sm:text-3xl lg:text-4xl">
            Turning Aspirations into{" "}
            <span className="text-primary">
              Achievements
            </span>
          </h2>

          {/* Description */}
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Our commitment to quality education, expert guidance,
            and consistent preparation helps students move closer
            to their government job goals.
          </p>
        </div>

        {/* Achievement Statistics */}
        <div className="relative z-10 mt-8 grid grid-cols-1 gap-3 sm:mt-10 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

          {achievements.map((achievement) => {
            const Icon = achievement.icon;

            return (
              <div
                key={achievement.label}
                className="
                  group flex min-w-0 flex-col items-center justify-center
                  rounded-xl border border-border bg-background
                  px-3 py-5 text-center shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1 hover:border-primary/30 hover:shadow-md
                  sm:py-6
                "
              >
                {/* Icon */}
                <Icon className="size-6 text-primary transition-transform duration-300 group-hover:scale-110 sm:size-7" />

                {/* Value */}
                <p className="mt-3 break-words text-2xl font-extrabold text-foreground sm:text-3xl">
                  {achievement.value}
                </p>

                {/* Label */}
                <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">
                  {achievement.label}
                </p>
              </div>
            );
          })}

        </div>
      </div>
    </section>
  );
}

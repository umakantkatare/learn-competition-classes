import {
  Award,
  Users,
  ClipboardList,
  ClipboardCheck,
  FileText,
  UserRoundCheck,
} from "lucide-react";

import type { LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  description: string;
  icon: LucideIcon;
};

const features: Feature[] = [
  {
    title: "Experienced Faculty",
    description: "12+ years of teaching experience",
    icon: Award,
  },
  {
    title: "Bilingual Classes",
    description: "Hindi + English for better understanding",
    icon: Users,
  },
  {
    title: "Structured Study Plan",
    description: "Topic-wise & exam-wise preparation",
    icon: ClipboardList,
  },
  {
    title: "Regular Tests",
    description: "Chapter tests, mock tests & performance analysis",
    icon: ClipboardCheck,
  },
  {
    title: "Updated Content",
    description: "As per latest exam pattern and syllabus",
    icon: FileText,
  },
  {
    title: "Personal Guidance",
    description: "Doubt classes & individual support",
    icon: UserRoundCheck,
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-background px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-3xl">
            Why Choose <span className="text-primary">LCC Institute?</span>
          </h2>

          <div className="mt-2 h-1 w-12 rounded-full bg-primary" />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="
                  group flex h-full flex-col
                  rounded-xl border border-border bg-card
                  p-3 shadow-sm
                  transition-all duration-300
                  hover:-translate-y-1
                  hover:border-primary/30
                  hover:shadow-md
                  sm:p-4
                "
              >
                {/* Icon */}
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-110 sm:size-12">
                  <Icon className="size-5 sm:size-6" strokeWidth={2} />
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-bold leading-5 text-foreground sm:text-base">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

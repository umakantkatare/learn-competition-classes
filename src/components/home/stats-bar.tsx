import {
  BadgeCheck,
  MessageSquareText,
  Users,
  UserRoundCheck,
} from "lucide-react";

const stats = [
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
    description: "",
  },
  {
    icon: MessageSquareText,
    value: "Bilingual Classes",
    title: "(Hindi + English)",
    description: "",
  },
  {
    icon: UserRoundCheck,
    value: "Regular Tests",
    title: "& Doubt Support",
    description: "",
  },
];

export function StatsBar() {
  return (
    <section className="relative z-20 -mt-5 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid grid-cols-2 gap-y-5 md:grid-cols-4 md:gap-y-0">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.value}
                className={`flex items-center gap-3 px-2 sm:gap-4 sm:px-4 ${
                  index % 2 === 0 ? "" : ""
                } ${index !== 0 ? "md:border-l md:border-slate-200" : ""}`}
              >
                {/* Icon */}
                <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-orange-50 sm:size-14">
                  <Icon className="size-6 text-[#f04b12] sm:size-7" />
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold leading-tight text-[#17375e] sm:text-xl">
                    {stat.value}
                  </h3>

                  <p className="mt-1 text-xs font-medium text-[#17375e] sm:text-sm">
                    {stat.title}
                  </p>

                  {stat.description && (
                    <p className="text-xs text-slate-500">{stat.description}</p>
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

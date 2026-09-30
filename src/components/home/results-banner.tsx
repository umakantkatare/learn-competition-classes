import {
  Trophy,
  Users,
  GraduationCap,
  CalendarCheck,
  Star,
} from "lucide-react";

const achievements = [
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
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl bg-[#064e42] px-5 py-8 sm:px-8 sm:py-10 lg:px-12">
        {/* Background Decorations */}
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full border-[30px] border-white/5" />

        <div className="pointer-events-none absolute -bottom-32 -left-16 size-64 rounded-full border-[30px] border-white/5" />

        {/* Heading */}
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f59e0b] shadow-lg sm:size-16">
            <Trophy className="size-7 text-white sm:size-8" />
          </div>

          <h2 className="mt-5 text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
            Turning Aspirations into{" "}
            <span className="text-[#fbbf24]">Achievements</span>
          </h2>

          <p className="mt-3 text-sm leading-6 text-emerald-100 sm:text-base">
            Our commitment to quality education, expert guidance, and consistent
            preparation helps students move closer to their government job
            goals.
          </p>
        </div>

        {/* Achievement Statistics */}
        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-4">
          {achievements.map((achievement, index) => {
            const Icon = achievement.icon;

            return (
              <div
                key={achievement.label}
                className={`flex flex-col items-center justify-center rounded-xl border border-white/10 bg-white/5 px-3 py-5 text-center transition-colors hover:bg-white/10 sm:py-6 ${
                  index > 0 ? "" : ""
                }`}
              >
                <Icon className="size-6 text-[#fbbf24] sm:size-7" />

                <p className="mt-3 text-2xl font-extrabold text-white sm:text-3xl">
                  {achievement.value}
                </p>

                <p className="mt-1 text-xs font-medium text-emerald-100 sm:text-sm">
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

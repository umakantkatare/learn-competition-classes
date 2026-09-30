import {
  Award,
  Users,
  ClipboardList,
  ClipboardCheck,
  FileText,
  UserRoundCheck,
} from "lucide-react";

const features = [
  {
    title: "Experienced Faculty",
    description: "12+ years of teaching experience",
    icon: Award,
    iconColor: "text-amber-600",
    iconBg: "bg-amber-100",
  },
  {
    title: "Bilingual Classes",
    description: "Hindi + English for better understanding",
    icon: Users,
    iconColor: "text-emerald-700",
    iconBg: "bg-emerald-100",
  },
  {
    title: "Structured Study Plan",
    description: "Topic-wise & exam-wise preparation",
    icon: ClipboardList,
    iconColor: "text-orange-600",
    iconBg: "bg-orange-100",
  },
  {
    title: "Regular Tests",
    description: "Chapter tests, mock tests & performance analysis",
    icon: ClipboardCheck,
    iconColor: "text-rose-600",
    iconBg: "bg-rose-100",
  },
  {
    title: "Updated Content",
    description: "As per latest exam pattern and syllabus",
    icon: FileText,
    iconColor: "text-blue-600",
    iconBg: "bg-blue-100",
  },
  {
    title: "Personal Guidance",
    description: "Doubt classes & individual support",
    icon: UserRoundCheck,
    iconColor: "text-purple-600",
    iconBg: "bg-purple-100",
  },
];

export function WhyChooseUs() {
  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-6">
          <h2 className="text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl">
            Why Choose <span className="text-[#ef2929]">LCC Institute?</span>
          </h2>

          <div className="mt-2 h-1 w-12 rounded-full bg-[#ef4b13]" />
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 lg:gap-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="group rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-200 hover:shadow-md sm:p-4"
              >
                {/* Icon */}
                <div
                  className={`flex size-12 items-center justify-center rounded-full ${feature.iconBg} transition-transform group-hover:scale-105`}
                >
                  <Icon
                    className={`size-6 ${feature.iconColor}`}
                    strokeWidth={2}
                  />
                </div>

                {/* Title */}
                <h3 className="mt-3 text-sm font-bold leading-5 text-[#17375e]">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="mt-1 text-xs leading-5 text-slate-500">
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

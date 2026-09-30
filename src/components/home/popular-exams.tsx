import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Building2,
  BusFront,
  GraduationCap,
  Landmark,
  Monitor,
  Shield,
  ShieldCheck,
  TrainFront,
  TreePine,
  Users,
} from "lucide-react";

const exams = [
  {
    name: "SSC",
    description: "Staff Selection Commission",
    icon: ShieldCheck,
    color: "#ef4444",
    bg: "#fff1f2",
    href: "/exams/ssc",
  },
  {
    name: "BANKING",
    description: "Banking Exams (IBPS, SBI, etc.)",
    icon: Landmark,
    color: "#1684e8",
    bg: "#eff6ff",
    href: "/exams/banking",
  },
  {
    name: "RAILWAY",
    description: "Railway Exams (NTPC, Group D, etc.)",
    icon: TrainFront,
    color: "#9333ea",
    bg: "#faf5ff",
    href: "/exams/railway",
  },
  {
    name: "PATWARI",
    description: "MP Patwari",
    icon: Building2,
    color: "#d97706",
    bg: "#fffbeb",
    href: "/exams/patwari",
  },
  {
    name: "STENO",
    description: "Stenographer",
    icon: Monitor,
    color: "#047857",
    bg: "#ecfdf5",
    href: "/exams/steno",
  },
  {
    name: "MAHILA SUPERVISOR",
    description: "Mahila Supervisor",
    icon: Users,
    color: "#e11d48",
    bg: "#fff1f2",
    href: "/exams/mahila-supervisor",
  },
  {
    name: "ARMY",
    description: "Indian Army",
    icon: Shield,
    color: "#0284c7",
    bg: "#f0f9ff",
    href: "/exams/army",
  },
  {
    name: "AIRFORCE",
    description: "Indian Airforce",
    icon: BusFront,
    color: "#2563eb",
    bg: "#eff6ff",
    href: "/exams/airforce",
  },
  {
    name: "MP SI",
    description: "MP SI",
    icon: ShieldCheck,
    color: "#e11d48",
    bg: "#fff1f2",
    href: "/exams/mp-si",
  },
  {
    name: "MP POLICE",
    description: "MP Police",
    icon: GraduationCap,
    color: "#7e22ce",
    bg: "#faf5ff",
    href: "/exams/mp-police",
  },
  {
    name: "FOREST GUARD",
    description: "Forest Guard",
    icon: TreePine,
    color: "#047857",
    bg: "#ecfdf5",
    href: "/exams/forest-guard",
  },
  {
    name: "MP TET",
    description: "Grade 1, 2, 3",
    icon: BookOpen,
    color: "#ea580c",
    bg: "#fff7ed",
    href: "/exams/mp-tet",
  },
];

export function PopularExams() {
  return (
    <section className="bg-[#fffdf8] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section Heading */}
        <div className="mb-5 flex flex-col justify-between gap-3 border-b border-orange-100 pb-4 md:flex-row md:items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-[#171717] sm:text-3xl">
              Popular <span className="text-[#ef4b13]">Exams</span> We Prepare
              For
            </h2>

            <div className="mt-2 h-1 w-12 rounded-full bg-[#ef4b13]" />
          </div>

          <p className="text-sm text-slate-500">
            Choose your target exam and start your preparation with expert
            guidance.
          </p>
        </div>

        {/* Exam Cards */}
        <div className="-mx-4 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0">
          <div className="grid w-max grid-cols-12 gap-2 sm:w-full sm:grid-cols-3 sm:gap-3 lg:grid-cols-6">
            {exams.map((exam) => {
              const Icon = exam.icon;

              return (
                <Link
                  key={exam.name}
                  href={exam.href}
                  className="group flex w-[145px] flex-col items-center rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md sm:w-auto sm:min-w-0"
                >
                  {/* Icon */}
                  <div
                    className="flex size-12 items-center justify-center rounded-xl transition-transform group-hover:scale-105"
                    style={{ backgroundColor: exam.bg }}
                  >
                    <Icon
                      className="size-7"
                      style={{ color: exam.color }}
                      strokeWidth={2}
                    />
                  </div>

                  {/* Exam Name */}
                  <h3
                    className="mt-3 min-h-8 text-xs font-extrabold"
                    style={{ color: exam.color }}
                  >
                    {exam.name}
                  </h3>

                  {/* Description */}
                  <p className="mt-1 line-clamp-2 min-h-8 text-[10px] leading-4 text-slate-500">
                    {exam.description}
                  </p>

                  <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-[#17375e] opacity-0 transition-opacity group-hover:opacity-100">
                    Explore <ArrowRight className="size-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

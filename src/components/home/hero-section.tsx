import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BookOpen,
  ChartNoAxesCombined,
  CirclePlay,
  GraduationCap,
  Target,
  Users,
} from "lucide-react";

const benefits = [
  {
    icon: BookOpen,
    title: "Concept Clarity",
    description: "From Basics to Advanced",
    color: "bg-orange-100 text-orange-600",
  },
  {
    icon: Target,
    title: "Exam Oriented",
    description: "Study Plan & Practice",
    color: "bg-[#f5a800]/15 text-[#b37b00]",
  },
  {
    icon: Users,
    title: "Personal Guidance",
    description: "Doubt Support",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Better Results",
    description: "Proven Track Record",
    color: "bg-rose-100 text-rose-600",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#fffaf0]">
      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-2 lg:px-8 lg:py-16">
        {/* Left Content */}
        <div className="relative z-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-[#b37b00] sm:text-sm">
            A Focused Institute for Bilingual Classes
          </p>

          <h1 className="text-4xl font-extrabold leading-[1.12] tracking-tight text-[#171717] sm:text-5xl lg:text-6xl">
            Your Success in{" "}
            <span className="text-[#f5a800]">Competitive Exams</span> Starts
            Here
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-[#24456b] sm:text-lg">
            Bilingual Classes (Hindi + English) | Expert Faculty | Structured
            Study Plan | Regular Tests | Personal Guidance
          </p>

          {/* Benefits */}
          <div className="mt-7 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="flex flex-col items-center text-center"
                >
                  <div
                    className={`flex size-12 items-center justify-center rounded-full ${benefit.color}`}
                  >
                    <Icon className="size-6" />
                  </div>

                  <h3 className="mt-2 text-sm font-bold text-[#17375e]">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/courses"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg bg-[#f5a800] px-6 text-sm font-semibold text-black transition hover:bg-[#e09a00]"
            >
              Explore Courses
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/demo"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-[#f5a800] bg-white px-6 text-sm font-semibold text-black transition hover:bg-[#fff4d6]"
            >
              <CirclePlay className="size-5 text-red-600" />
              Watch Demo
            </Link>
          </div>

          {/* Student Statistics */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-slate-200"
                >
                  <GraduationCap className="size-5 text-slate-600" />
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-bold text-[#17375e]">
                10,000+ Students
              </p>

              <p className="text-xs text-slate-500">
                on their Government Job Journey
              </p>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative mx-auto w-full max-w-xl lg:min-h-[530px]">
          {/* Director Background */}
          <div className="absolute inset-0 rounded-full " />

          {/* Director Image */}
          <div className="relative z-10 h-[360px] w-full sm:h-[470px]">
            <Image
              src="/images/home/director.png"
              // src="/images/home/doctor.png"
              alt="Pawan Sir, Director of LCC Institute"
              fill
              priority
              sizes="(max-width: 1024px) 50vw, 100vw"
              className="object-contain"
            />
          </div>

          {/* Director Name */}
          <div className="relative z-20 mx-auto -mt-6 w-fit rounded-2xl border border-[#e9d7a0] bg-[#fff7df] px-8 py-3 text-center shadow-lg">
            <p className="text-xs text-slate-600">Director</p>

            <h2 className="text-xl font-extrabold text-[#171717]">PAWAN SIR</h2>

            <p className="text-xs text-slate-600">Expert in Math & Reasoning</p>
          </div>
        </div>
      </div>
    </section>
  );
}

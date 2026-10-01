import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "cn";
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
    color: "bg-accent text-brand-primary",
  },
  {
    icon: Target,
    title: "Exam Oriented",
    description: "Study Plan & Practice",
    color: "bg-brand-primary/15 text-brand-primary",
  },
  {
    icon: Users,
    title: "Personal Guidance",
    description: "Doubt Support",
    color: "bg-accent text-brand-dark",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Better Results",
    description: "Proven Track Record",
    color: "bg-brand-primary-hover/10 text-brand-primary-hover",
  },
];

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto grid max-w-content grid-cols-1 items-center gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-2 lg:px-8 lg:py-16">
        {/* Left Content */}
        <div className="relative z-10">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.15em] text-brand-primary sm:text-sm">
            A Focused Institute for Bilingual Classes
          </p>

          <h1 className="font-heading text-4xl font-extrabold leading-[1.12] tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
            Your Success in{" "}
            <span className="text-brand-primary">Competitive Exams</span> Starts
            Here
          </h1>

          <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
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

                  <h3 className="mt-2 text-sm font-bold text-brand-dark">
                    {benefit.title}
                  </h3>

                  <p className="mt-1 text-xs text-text-secondary">
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
              className={cn(buttonVariants({ variant: "default", size: "lg" }))}
            >
              Explore Courses
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/demo"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            >
              <CirclePlay className="size-5 text-brand-primary-hover" />
              Watch Demo
            </Link>
          </div>

          {/* Student Statistics */}
          <div className="mt-7 flex items-center gap-3">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="flex size-10 items-center justify-center overflow-hidden rounded-full border-2 border-surface bg-muted"
                >
                  <GraduationCap className="size-5 text-text-secondary" />
                </div>
              ))}
            </div>

            <div>
              <p className="text-sm font-bold text-brand-dark">
                10,000+ Students
              </p>

              <p className="text-xs text-text-secondary">
                on their Government Job Journey
              </p>
            </div>
          </div>
        </div>

        {/* Right Visual */}
        <div className="relative mx-auto w-full max-w-xl lg:min-h-[530px]">
          {/* Director Background */}
          <div
            className="
      pointer-events-none
      absolute
      left-1/2
      top-[6%]
      h-[82%]
      w-[78%]
      -translate-x-1/2
      rounded-full
      bg-brand-primary/15
    "
          />

          {/* Director Image */}
          <div className="relative z-10 h-[360px] w-full sm:h-[470px]">
            <Image
              src="/images/home/doctor.webp"
              alt="Pawan Sir, Director of LCC Institute"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 36rem"
              className="object-contain object-bottom"
            />
          </div>

          {/* Director Name */}
          <div className="relative z-20 mx-auto -mt-5 w-75 rounded-card border border-border bg-accent px-8 py-3 text-center shadow-lg">
            <p className="text-xs text-text-secondary">Director</p>

            <h2 className="font-heading text-xl font-extrabold text-text-primary">
              PAWAN SIR
            </h2>

            <p className="text-xs text-text-secondary">
              Expert in Math & Reasoning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

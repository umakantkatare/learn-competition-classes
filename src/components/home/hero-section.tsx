import Image from "next/image";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute
          -right-32 -top-32 size-80
          rounded-full bg-brand-primary/5 blur-3xl
        "
      />

      <div
        className="
          relative mx-auto grid w-full
          max-w-content grid-cols-1
          items-center gap-10
          px-4 py-10
          sm:px-6 sm:py-12
          md:py-16
          lg:grid-cols-2 lg:gap-8
          lg:px-8 lg:py-16
          xl:gap-12
        "
      >
        {/* Left Content */}
        <div className="relative z-10 w-full">
          {/* Eyebrow */}
          <p
            className="
              mb-4 inline-flex items-center
              rounded-full border border-brand-primary/20
              bg-accent px-3 py-1.5
              text-[10px] font-bold
              uppercase tracking-[0.14em]
              text-brand-dark
              sm:text-xs
            "
          >
            A Focused Institute for Bilingual Classes
          </p>

          {/* Heading */}
          <h1
            className="
              max-w-2xl font-heading
              text-3xl font-extrabold
              leading-[1.15] tracking-tight
              text-foreground
              sm:text-4xl
              md:text-5xl
              lg:text-[3.25rem]
              xl:text-6xl
            "
          >
            Your Success in{" "}
            <span className="text-brand-primary">Competitive Exams</span> Starts
            Here
          </h1>

          {/* Description */}
          <p
            className="
              mt-5 max-w-xl
              text-sm leading-7
              text-muted-foreground
              sm:text-base
              md:text-lg
            "
          >
            Bilingual Classes (Hindi + English) | Expert Faculty | Structured
            Study Plan | Regular Tests | Personal Guidance
          </p>

          {/* Benefits */}
          <div
            className="
              mt-8 grid grid-cols-2
              gap-x-3 gap-y-6
              sm:grid-cols-4 sm:gap-4
            "
          >
            {benefits.map((benefit) => {
              const Icon = benefit.icon;

              return (
                <div
                  key={benefit.title}
                  className="
                    flex min-w-0 flex-col
                    items-center text-center
                  "
                >
                  <div
                    className={cn(
                      "flex size-11 items-center justify-center rounded-xl sm:size-12",
                      benefit.color,
                    )}
                  >
                    <Icon className="size-5 sm:size-6" />
                  </div>

                  <h3
                    className="
                      mt-2 text-xs font-bold
                      text-foreground sm:text-sm
                    "
                  >
                    {benefit.title}
                  </h3>

                  <p
                    className="
                      mt-1 text-[10px]
                      leading-4 text-muted-foreground
                      sm:text-xs
                    "
                  >
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* CTA Buttons */}
          <div
            className="
              mt-8 flex flex-col gap-3
              sm:flex-row sm:items-center
            "
          >
            <Link
              href="/batches"
              className={cn(
                buttonVariants({
                  variant: "default",
                  size: "lg",
                }),
                `
                  h-12 w-full gap-2
                  rounded-button px-6
                  font-semibold shadow-sm
                  transition-all duration-200
                  hover:shadow-md
                  sm:w-auto
                `,
              )}
            >
              Explore Courses
              <ArrowRight className="size-4" />
            </Link>

            <Link
              href="/demo"
              className={cn(
                buttonVariants({
                  variant: "outline",
                  size: "lg",
                }),
                `
                  h-12 w-full gap-2
                  rounded-button px-6
                  border-border bg-card
                  font-semibold
                  transition-all duration-200
                  hover:border-brand-primary
                  hover:text-brand-primary
                  sm:w-auto
                `,
              )}
            >
              <CirclePlay className="size-5 text-brand-primary" />
              Watch Demo
            </Link>
          </div>
        </div>

        {/* Right Visual */}
        <div
          className="
            relative mx-auto flex w-full
            max-w-md flex-col items-center
            justify-end
            sm:max-w-lg
            lg:max-w-none
          "
        >
          {/* Background Shape */}
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute
              bottom-[12%] left-1/2
              aspect-square w-[78%]
              -translate-x-1/2
              rounded-full
              bg-brand-primary/15
            "
          />

          {/* Director Image */}
          <div
            className="
              relative z-10
              h-[300px] w-full
              sm:h-[400px]
              md:h-[460px]
              lg:h-[480px]
              xl:h-[540px]
            "
          >
            <Image
              src="/images/home/doctor.webp"
              alt="Director"
              fill
              priority
              className="object-contain"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 50vw"
            />
          </div>

          {/* Director Information */}
          <div
            className="
              relative z-20
              -mt-3 w-[min(18rem,90%)]
              rounded-card
              border border-border
              bg-card px-5 py-3
              text-center shadow-lg
              sm:px-8
            "
          >
            <p className="text-xs font-medium text-muted-foreground">
              Director
            </p>

            <h2
              className="
                mt-1 font-heading
                text-xl font-extrabold
                tracking-tight text-foreground
              "
            >
              PAWAN SIR
            </h2>

            <p className="mt-1 text-xs text-muted-foreground">
              Expert in Math & Reasoning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

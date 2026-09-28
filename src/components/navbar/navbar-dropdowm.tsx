"use client";

import Link from "next/link";
import {
  BookOpen,
  FileText,
  Landmark,
  TrainFront,
  ShieldCheck,
  ChevronRight,
  ClipboardList,
  GraduationCap,
} from "lucide-react";

const courseItems = [
  {
    title: "All Courses",
    href: "/courses",
    icon: BookOpen,
  },
  {
    title: "SSC Courses",
    href: "/courses/ssc",
    icon: FileText,
  },
  {
    title: "Banking Courses",
    href: "/courses/banking",
    icon: Landmark,
  },
  {
    title: "Railway Courses",
    href: "/courses/railway",
    icon: TrainFront,
  },
  {
    title: "MP Police Courses",
    href: "/courses/mp-police",
    icon: ShieldCheck,
  },
];

const testSeriesItems = [
  {
    title: "All Test Series",
    href: "/test-series",
    icon: ClipboardList,
  },
  {
    title: "SSC Test Series",
    href: "/test-series/ssc",
    icon: FileText,
  },
  {
    title: "Banking Test Series",
    href: "/test-series/banking",
    icon: Landmark,
  },
  {
    title: "Railway Test Series",
    href: "/test-series/railway",
    icon: TrainFront,
  },
  {
    title: "MP Police Test Series",
    href: "/test-series/mp-police",
    icon: GraduationCap,
  },
];

interface NavbarDropdownProps {
  type: "courses" | "test-series";
}

export default function NavbarDropdown({ type }: NavbarDropdownProps) {
  const items = type === "courses" ? courseItems : testSeriesItems;

  return (
    <div
      className="invisible absolute left-0 top-full z-50
        w-80 translate-y-2 pt-3 opacity-0
        transition-all duration-200
        group-hover:visible group-hover:translate-y-0
        group-hover:opacity-100
        group-focus-within:visible
        group-focus-within:translate-y-0
        group-focus-within:opacity-100"
    >
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
        <div className="flex flex-col gap-1">
          {items.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group/item flex items-center
                  justify-between gap-3 rounded-xl
                  px-4 py-3.5 text-sm font-medium
                  text-gray-800 transition-colors
                  hover:bg-amber-50 hover:text-[#EFA400]"
              >
                <span className="flex items-center gap-4">
                  <Icon size={22} strokeWidth={1.8} className="shrink-0" />

                  <span>{item.title}</span>
                </span>

                <ChevronRight
                  size={18}
                  className="shrink-0 text-gray-500
                    transition-transform
                    group-hover/item:translate-x-1
                    group-hover/item:text-[#EFA400]"
                />
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
